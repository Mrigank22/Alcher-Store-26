import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import OrderItem from "@/models/OrderItem";
import Product from "@/models/Product";

export async function PUT(req: Request) {
  try {
    // 1. Authentication Check
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get the update data
    const { orderItemId, newQuantity, newSize } = await req.json();

    if (!orderItemId) {
      return NextResponse.json({ error: "Order Item ID is required" }, { status: 400 });
    }

    await connectDB();

    // 3. Find the existing Order Item
    const orderItem = await OrderItem.findById(orderItemId);
    if (!orderItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    // 4. Find the referenced Product to check REAL price and REAL stock
    // We cannot trust the frontend for price. We must fetch it again.
    const product = await Product.findById(orderItem.product);
    if (!product) {
      return NextResponse.json({ error: "Product no longer exists" }, { status: 404 });
    }

    // 5. Determine what is changing
    const quantityToUse = newQuantity ? Number(newQuantity) : orderItem.quantity;
    const sizeToUse = newSize || orderItem.size;

    // 6. Validate Stock for the NEW values
    let availableStock = 0;
    
    if (product.size_boolean) {
        // Find stock for the specific size (either the new size or the old one)
        const sizeItem = product.stock.find((s: any) => s.size === sizeToUse);
        availableStock = sizeItem ? sizeItem.quantity : 0;
    } else {
        availableStock = product.stock_quantity;
    }

    if (quantityToUse > availableStock) {
        return NextResponse.json({ 
            error: `Stock limit reached. Only ${availableStock} available.` 
        }, { status: 400 });
    }

    // 7. RECALCULATE COST (Critical Step)
    // Always use the database price * the new quantity
    const newCost = product.price * quantityToUse;

    // 8. Update and Save
    orderItem.quantity = quantityToUse;
    orderItem.size = sizeToUse;
    orderItem.cost = newCost; // Automatically updated
    
    await orderItem.save();

    return NextResponse.json({ 
        message: "Cart updated successfully", 
        updatedItem: orderItem 
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}