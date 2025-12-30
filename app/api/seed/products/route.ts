import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

/**
 * POST /api/admin/product/seed
 * Seeds database with demo products (TEAM SCHEMA)
 */
export async function POST() {
  try {
    await connectDB();

    const demoProducts = [
      // ===== SIZE PRODUCTS =====
      {
        product_id: "ALCH001",
        name: "Alcheringa T-Shirt",
        price: 499,
        imageUrl:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
        hasSize: true,
        hasColor: false,
        variants: [
          { size: "S", stock: 2000 },
          { size: "M", stock: 3000 },
          { size: "L", stock: 2500 },
          { size: "XL", stock: 1500 },
        ],
      },
      {
        product_id: "ALCH002",
        name: "Fest Hoodie",
        price: 899,
        imageUrl:
          "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500",
        hasSize: true,
        hasColor: false,
        variants: [
          { size: "S", stock: 1000 },
          { size: "M", stock: 2000 },
          { size: "L", stock: 1500 },
          { size: "XL", stock: 1000 },
        ],
      },
      {
        product_id: "ALCH003",
        name: "Event Polo Shirt",
        price: 599,
        imageUrl:
          "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500",
        hasSize: true,
        hasColor: false,
        variants: [
          { size: "S", stock: 1500 },
          { size: "M", stock: 2500 },
          { size: "L", stock: 2000 },
          { size: "XL", stock: 1000 },
        ],
      },

      // ===== SIMPLE PRODUCTS =====
      {
        product_id: "ALCH004",
        name: "College Cap",
        price: 299,
        imageUrl:
          "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500",
        hasSize: false,
        hasColor: false,
        variants: [{ stock: 5000 }],
      },
      {
        product_id: "ALCH005",
        name: "Festival Backpack",
        price: 1299,
        imageUrl:
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
        hasSize: false,
        hasColor: false,
        variants: [{ stock: 3000 }],
      },
      {
        product_id: "ALCH006",
        name: "Alcheringa Mug",
        price: 199,
        imageUrl:
          "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500",
        hasSize: false,
        hasColor: false,
        variants: [{ stock: 1000 }],
      },
      {
        product_id: "ALCH007",
        name: "Fest Wristband",
        price: 99,
        imageUrl:
          "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=500",
        hasSize: false,
        hasColor: false,
        variants: [{ stock: 2000 }],
      },
    ];

    // Clean old demo products
    await Product.deleteMany({
      product_id: { $in: demoProducts.map((p) => p.product_id) },
    });

    const inserted = await Product.insertMany(demoProducts);

    return NextResponse.json({
      success: true,
      count: inserted.length,
      data: inserted,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
