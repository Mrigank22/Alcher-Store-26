import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  await connectDB();
  const products = await Product.find();
  return Response.json(products);
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const product = await Product.create({
      product_id: body.product_id,

      name: body.name,
      price: Number(body.price),
      description: body.description ?? "",

      imageUrl:
        body.imageUrl && body.imageUrl.trim() !== ""
          ? body.imageUrl
          : "/placeholder.png",

      hasSize: Boolean(body.hasSize),
      hasColor: Boolean(body.hasColor),

      variants:
        Array.isArray(body.variants) && body.variants.length > 0
          ? body.variants.map((v: any) => ({
              size: v.size ?? undefined,
              color: v.color ?? undefined,
              stock: Number(v.stock) || 0,
            }))
          : (() => {
              throw new Error("At least one variant is required");
            })(),
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    console.error("PRODUCT CREATE ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
