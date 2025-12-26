import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

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

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "Email required" },
      { status: 400 }
    );
  }

  const cart = await Cart.findOne({ user_email: email })
    .populate("items.product");

  return NextResponse.json(cart || { items: [] });
}

/* ADD TO CART  */
export async function POST(req: Request) {
  await connectDB();
  const { email, product, size, colour, quantity = 1 } = await req.json();

  if (!email || !product) {
    return NextResponse.json(
      { error: "Email and product required" },
      { status: 400 }
    );
  }

  const productDoc = await Product.findById(product);
  if (!productDoc) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }

  // Validate variant selection for products with size/color
  if (productDoc.hasSize && !size) {
    return NextResponse.json(
      { error: "Please select a size" },
      { status: 400 }
    );
  }

  if (productDoc.hasColor && !colour) {
    return NextResponse.json(
      { error: "Please select a color" },
      { status: 400 }
    );
  }

  // Validate stock for selected variant
  const selectedVariant = productDoc.variants.find(
    (v: any) => 
      (!productDoc.hasSize || v.size === size) &&
      (!productDoc.hasColor || v.color === colour)
  );

  if (!selectedVariant || selectedVariant.stock < quantity) {
    return NextResponse.json(
      { error: "Insufficient stock for selected variant" },
      { status: 400 }
    );
  }

  let cart = await Cart.findOne({ user_email: email });

  if (!cart) {
    cart = await Cart.create({
      user_email: email,
      items: [],
    });
  }

  const existingItem = cart.items.find(
    (i: any) =>
      i.product.toString() === product &&
      i.size === size &&
      i.colour === colour
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      product,
      size,
      colour,
      quantity,
      price: productDoc.price,
    });
  }

  recalcCart(cart);
  await cart.save();

  return NextResponse.json(cart);
}

/*UPDATE QUANTITY */
export async function PATCH(req: Request) {
  await connectDB();


  const { email, product, size, colour, quantity } =
    await req.json();

  if (!email || !product || !size || quantity < 1) {
    return NextResponse.json(
      { error: "Invalid data" },
      { status: 400 }
    );
  }

  if (quantity < 1) {
    return NextResponse.json(
      { error: "Quantity must be >= 1" },
      { status: 400 }
    );
  }

  const cart = await Cart.findOne({ user_email: email });
  if (!cart) {
    return NextResponse.json(
      { error: "Cart not found" },
      { status: 404 }
    );
  }

  const item = cart.items.find(
    (i: any) =>
      i.product.toString() === product &&
      i.size === size &&
      i.colour === colour
  );

  if (!item) {
    return NextResponse.json(
      { error: "Item not found" },
      { status: 404 }
    );
  }

  item.quantity = quantity;
  recalcCart(cart);
  await cart.save();

  return NextResponse.json(cart);
}


export async function DELETE(req: Request) {
  await connectDB();

  const { email, product, size, colour } = await req.json();

  if (!email || !product) {
    return NextResponse.json(
      { error: "Missing data" },
      { status: 400 }
    );
  }

  const cart = await Cart.findOne({ user_email: email });
  if (!cart) {
    return NextResponse.json(
      { error: "Cart not found" },
      { status: 404 }
    );
  }

  cart.items = cart.items.filter((i: any) => {
    if (i.size) {
      return !(
        i.product.toString() === product &&
        i.size === size &&
        i.colour === colour
      );
    }
    return i.product.toString() !== product;
  });

  recalcCart(cart);
  await cart.save();

  return NextResponse.json(cart);
}
