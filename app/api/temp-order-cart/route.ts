import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import TempCart from "@/models/TempCart";
import Product from "@/models/Product";

// Helper to calculate totals
function recalcCart(cart: any) {
  cart.total_quantity = cart.items.reduce((sum: number, i: any) => sum + i.quantity, 0);
  cart.total_price = cart.items.reduce((sum: number, i: any) => sum + i.quantity * i.price, 0);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. READ ALL DATA (Including Colour and variantName!)
    const { productId, size, variantName, colour, quantity } = await req.json(); 

    if (!productId || !quantity) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectDB();
    const productDoc = await Product.findOne({ product_id: productId }).populate('category') 
      || await Product.findById(productId).populate('category');

    if (!productDoc) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 2. CHECK STOCK (Team's Variant Logic)
    const isMerch = productDoc.category?.name === 'Merch';
    const selectedVariant = productDoc.variants.find(
      (v: any) => 
        (isMerch ? (!productDoc.hasSize || v.size === size) : v.variantName === variantName) &&
        (!productDoc.hasColor || v.color === colour)
    );

    if (!selectedVariant) {
        return NextResponse.json({ error: "Variant unavailable" }, { status: 400 });
    }
    
    if (quantity > selectedVariant.stock) {
        return NextResponse.json({ error: `Only ${selectedVariant.stock} left` }, { status: 400 });
    }

    // 3. UPDATE OR CREATE TEMP CART
    let tempCart = await TempCart.findOne({ user_email: session.user.email });
    
    if (tempCart) {
        tempCart.items = []; // "Buy Now" always clears previous temp items
    } else {
        tempCart = new TempCart({ user_email: session.user.email });
    }

    // 4. SAVE ITEM (Include Colour and variantName!)
    tempCart.items.push({
        product: productDoc._id,
        size: size || null,
        variantName: variantName || null,
        colour: colour || null, // <--- Saving colour correctly now
        quantity: Number(quantity),
        price: productDoc.price
    });

    recalcCart(tempCart);
    await tempCart.save();

    return NextResponse.json({ message: "Direct purchase initialized", cartId: tempCart._id }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const tempCart = await TempCart.findOne({ user_email: session.user.email }).populate({
      path: "items.product",
      populate: { path: "category" }
    });

    return NextResponse.json(tempCart || { items: [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}