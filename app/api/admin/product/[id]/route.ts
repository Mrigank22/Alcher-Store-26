// // import { connectDB } from "@/lib/mongodb";
// // import Product from "@/models/Product";
// // import { NextResponse } from "next/server";

// // export async function GET(
// //   req: Request,
// //   context: { params: Promise<{ id: string }> }
// // ) {
// //   await connectDB();

// //   const { id } = await context.params;

// //   const product = await Product.findOne({
// //     product_id: id,
// //   });

// //   if (!product) {
// //     return NextResponse.json(
// //       { error: "Product not found" },
// //       { status: 404 }
// //     );
// //   }

// //   return NextResponse.json(product);
// // }
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Media from "@/models/Media";
import { NextResponse } from "next/server";

interface ProductDoc {
  images?: string[];
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await context.params;

  const product = await Product.findOne({
    product_id: id,
  }).lean<ProductDoc>();

  if (!product) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }

  // 🔑 Fetch related media
  const mediaDocs = await Media.find({
    _id: { $in: product.images || [] },
  }).lean();

  // 🔁 Map mediaId → media object
  const mediaMap: Record<string, any> = {};
  for (const m of mediaDocs) {
    mediaMap[String(m._id)] = {
      id: m._id,
      url: `/media/${m.filename}`, // ✅ THIS is why images now work
      alt: m.alt || "",
    };
  }

  // 🔄 Replace image IDs with media objects
  const enrichedProduct = {
    ...product,
    images: (product.images || [])
      .map((id) => mediaMap[String(id)])
      .filter(Boolean),
  };

  return NextResponse.json(enrichedProduct);
}
