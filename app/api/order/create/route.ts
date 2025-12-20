import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import User from "@/models/User";
import OrderItem from "@/models/OrderItem";

export async function POST(req: Request) {
  try {
    // 1. Check Authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get data from Frontend
    const { productId, size, quantity } = await req.json();

    if (!productId || !quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // 3. Find the User
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4. Find the Product (to get real Price and check Stock)
    const product = await Product.findOne({ product_id: productId }); // Assuming passing product_id, or use _id
    // If frontend passes MongoDB _id, use: await Product.findById(productId);
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 5. Validation Logic
    // If product requires size, ensure size is selected
    if (product.size_boolean && !size) {
      return NextResponse.json({ error: "Please select a size" }, { status: 400 });
    }

    // Check stock 
    let availableStock = 0;
    if (product.size_boolean) {
        const sizeItem = product.stock.find((s: any) => s.size === size);
        availableStock = sizeItem ? sizeItem.quantity : 0;
    } else {
        availableStock = product.stock_quantity;
    }

    if (quantity > availableStock) {
        return NextResponse.json({ error: `Only ${availableStock} items left in stock` }, { status: 400 });
    }

    // 6. Calculate Cost (Your logic: Price * Quantity)
    const totalCost = product.price * Number(quantity);

    // 7. Create the Order Item 
    const newOrderItem = await OrderItem.create({
      user: user._id,
      product: product._id, // Saving the MongoDB Object ID
      size: size || null,
      quantity: Number(quantity),
      cost: totalCost,
      status: "cart"
    });

    
    // We add this new OrderItem ID to the User's cart array in User.ts
    await User.findByIdAndUpdate(user._id, {
        $push: { cart: newOrderItem._id } 
    });

    return NextResponse.json({ 
        message: "Item added to order list", 
        orderItem: newOrderItem 
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}