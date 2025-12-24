import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

/**
 * POST /api/seed/products
 * Seeds database with demo products
 * For development/testing only
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Demo products for Alcheringa fest
    const demoProducts = [
      {
        product_id: "ALCH001",
        name: "Alcheringa T-Shirt",
        img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
        price: 499,
        size_boolean: true,
        stock: [
          { size: "S", quantity: 20 },
          { size: "M", quantity: 30 },
          { size: "L", quantity: 25 },
          { size: "XL", quantity: 15 },
        ],
        stock_quantity: 0,
      },
      {
        product_id: "ALCH002",
        name: "Fest Hoodie",
        img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500",
        price: 899,
        size_boolean: true,
        stock: [
          { size: "S", quantity: 10 },
          { size: "M", quantity: 20 },
          { size: "L", quantity: 15 },
          { size: "XL", quantity: 10 },
        ],
        stock_quantity: 0,
      },
      {
        product_id: "ALCH003",
        name: "College Cap",
        img: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500",
        price: 299,
        size_boolean: false,
        stock: [],
        stock_quantity: 50,
      },
      {
        product_id: "ALCH004",
        name: "Festival Backpack",
        img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
        price: 1299,
        size_boolean: false,
        stock: [],
        stock_quantity: 30,
      },
      {
        product_id: "ALCH005",
        name: "Alcheringa Mug",
        img: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500",
        price: 199,
        size_boolean: false,
        stock: [],
        stock_quantity: 100,
      },
      {
        product_id: "ALCH006",
        name: "Fest Wristband",
        img: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=500",
        price: 99,
        size_boolean: false,
        stock: [],
        stock_quantity: 200,
      },
      {
        product_id: "ALCH007",
        name: "Event Polo Shirt",
        img: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500",
        price: 599,
        size_boolean: true,
        stock: [
          { size: "S", quantity: 15 },
          { size: "M", quantity: 25 },
          { size: "L", quantity: 20 },
          { size: "XL", quantity: 10 },
        ],
        stock_quantity: 0,
      },
      {
        product_id: "ALCH008",
        name: "Water Bottle",
        img: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500",
        price: 249,
        size_boolean: false,
        stock: [],
        stock_quantity: 75,
      },
      {
        product_id: "ALCH009",
        name: "Tote Bag",
        img: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500",
        price: 349,
        size_boolean: false,
        stock: [],
        stock_quantity: 60,
      },
      {
        product_id: "ALCH010",
        name: "Festival Bandana",
        img: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500",
        price: 149,
        size_boolean: false,
        stock: [],
        stock_quantity: 80,
      },
    ];

    // Clear existing demo products (optional)
    await Product.deleteMany({ product_id: { $in: demoProducts.map(p => p.product_id) } });

    // Insert demo products
    const result = await Product.insertMany(demoProducts);

    return NextResponse.json({
      success: true,
      message: `Successfully added ${result.length} demo products`,
      data: result,
    });
  } catch (error) {
    console.error("Error seeding products:", error);
    return NextResponse.json(
      { success: false, message: "Failed to seed products", error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/seed/products
 * Removes all demo products
 */
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const result = await Product.deleteMany({
      product_id: { $regex: /^ALCH/ },
    });

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} demo products`,
    });
  } catch (error) {
    console.error("Error deleting demo products:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete demo products" },
      { status: 500 }
    );
  }
}
