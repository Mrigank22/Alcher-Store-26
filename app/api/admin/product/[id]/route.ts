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
  variants?: any[];
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

  // 🔑 Fetch related media (product-level + variant-level)
  const allImageIds = [
    ...(product.images || []),
    ...(product.variants || []).flatMap((v: any) => v.images || [])
  ];
  
  const mediaDocs = await Media.find({
    _id: { $in: allImageIds },
  }).lean();

  // 🔁 Map mediaId → media object
  const mediaMap: Record<string, any> = {};
  for (const m of mediaDocs) {
    mediaMap[String(m._id)] = {
      id: m._id,
      url: `/api/media/${m.filename}`,
      alt: m.alt || "",
    };
  }

  // 🔄 Replace image IDs with media objects in product and variants
  const enrichedProduct = {
    ...product,
    category,
    images: (product.images || [])
      .map((id) => mediaMap[String(id)])
      .filter(Boolean),
    variants: (product.variants || []).map((v: any) => ({
      ...v,
      images: (v.images || [])
        .map((id: any) => mediaMap[String(id)])
        .filter(Boolean),
    })),
  };

  return NextResponse.json(enrichedProduct);
}
