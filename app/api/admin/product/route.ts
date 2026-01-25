import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductCategory from "@/models/ProductCategory";
import Media from "@/models/Media";

export async function GET() {
  await connectDB();

  const products = await Product.find().lean();
  const categories = await ProductCategory.find().lean();
  
  const categoryMap: Record<string, any> = {};
  categories.forEach((cat) => {
    categoryMap[String(cat._id)] = cat;
  });

  const imageIds = products.flatMap((p) => p.images || []);

  const mediaDocs = await Media.find({
    _id: { $in: imageIds },
  }).lean();

  const mediaMap: Record<string, any> = {};
  for (const m of mediaDocs) {
    mediaMap[String(m._id)] = {
      id: m._id,
      url: `/api/media/${m.filename}`,
      alt: m.alt || "",
    };
  }

  const enrichedProducts = products.map((p) => ({
    ...p,
    category: p.category ? categoryMap[String(p.category)] : null,
    images: (p.images || [])
      .map((id: any) => mediaMap[String(id)])
      .filter(Boolean),
  }));

  return Response.json(enrichedProducts);
}



export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const images =
      Array.isArray(body.images) && body.images.length > 0
        ? body.images
        : ["/placeholder.png"];

    const product = await Product.create({
      product_id: body.product_id,

      name: body.name,
      price: Number(body.price),
      description: body.description ?? "",
      productType: body.productType ?? "T-Shirt",

      category: body.category ?? null, // Save category ObjectId

     images,                
      primaryImageIndex:
        typeof body.primaryImageIndex === "number"
          ? body.primaryImageIndex
          : 0,

      hasSize: Boolean(body.hasSize),
      hasColor: Boolean(body.hasColor),

      variants:
        Array.isArray(body.variants) && body.variants.length > 0
          ? body.variants.map((v: any) => ({
              size: v.size ?? undefined,
              variantName: v.variantName ?? undefined,
              variantDescription: v.variantDescription ?? undefined,
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
