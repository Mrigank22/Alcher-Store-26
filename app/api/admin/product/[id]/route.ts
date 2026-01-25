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
import ProductCategory from "@/models/ProductCategory";
import Media from "@/models/Media";
import { NextResponse } from "next/server";

interface ProductDoc {
  images?: string[];
  category?: any;
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

  // 🔑 Fetch category if exists
  let category = null;
  if (product.category) {
    const categoryDoc = await ProductCategory.findById(product.category).lean<{ _id: any; name: string }>();
    if (categoryDoc) {
      category = {
        _id: categoryDoc._id,
        name: categoryDoc.name,
      };
    }
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
      url: `/api/media/${m.filename}`, // ✅ THIS is why images now work
      alt: m.alt || "",
    };
  }

  // 🔄 Replace image IDs with media objects
  const enrichedProduct = {
    ...product,
    category,
    images: (product.images || [])
      .map((id) => mediaMap[String(id)])
      .filter(Boolean),
  };

  return NextResponse.json(enrichedProduct);
}
