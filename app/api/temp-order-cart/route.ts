import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import TempCart from "@/models/TempCart";
import Product from "@/models/Product";

// Helper to calculate totals (Matches your team's logic)
function recalcCart(cart: any) {
  cart.total_quantity = cart.items.reduce(
    (sum: number, i: any) => sum + i.quantity,
    0
  );
  cart.total_price = cart.items.reduce(
    (sum: number, i: any) => sum + i.quantity * i.price,
    0
  );
}

/**
 * POST: "Buy Now" Button Click
 * Creates/Overwrites a Temporary Cart for the user
 */
export async function POST(req: Request) {
  try {
    // 1. Auth Check
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get Data
    const { productId, size, quantity } = await req.json();

    if (!productId || !quantity) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await connectDB();

    // 3. Robust Stock Check
    const product = await Product.findOne({ product_id: productId });
    
    // Fallback: If not found by product_id, try _id
    const productDoc = product || await Product.findById(productId);

    if (!productDoc) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Validate Size/Color Requirement
    if (productDoc.hasSize && !size) {
        return NextResponse.json({ error: "Size selection is required" }, { status: 400 });
    }

    // Validate Stock Quantity for selected variant
    const selectedVariant = productDoc.variants.find(
      (v: any) => 
        (!productDoc.hasSize || v.size === size) &&
        (!productDoc.hasColor || v.color === (req.body?.colour || null))
    );

    if (!selectedVariant) {
        return NextResponse.json(
            { error: "Selected variant not found" }, 
            { status: 400 }
        );
    }

    if (quantity > selectedVariant.stock) {
        return NextResponse.json(
            { error: `Out of Stock! Only ${selectedVariant.stock} left.` }, 
            { status: 400 }
        );
    }

    // 4. Create/Overwrite the Temp Cart
    // "Buy Now" replaces any previous "Buy Now" item for this user
    let tempCart = await TempCart.findOne({ user_email: session.user.email });

    if (tempCart) {
        // Clear existing items for a fresh "Buy Now" session
        tempCart.items = [];
    } else {
        tempCart = new TempCart({ user_email: session.user.email });
    }

    // 5. Add the single item
    tempCart.items.push({
        product: productDoc._id, // Save the Mongo _id reference
        size: size || null,
        quantity: Number(quantity),
        price: productDoc.price // Capture price securely from DB
    });

    recalcCart(tempCart);
    await tempCart.save();

    return NextResponse.json({ 
        message: "Direct purchase initialized", 
        cartId: tempCart._id 
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * GET: Checkout Page Load
 * Fetches the temporary cart details
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch and populate exactly like the main Cart API
    const tempCart = await TempCart.findOne({ user_email: session.user.email })
        .populate("items.product");

    if (!tempCart) {
        return NextResponse.json({ items: [] });
    }

    return NextResponse.json(tempCart);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}