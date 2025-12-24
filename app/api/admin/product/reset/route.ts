import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function DELETE() {
  await connectDB();

  const result = await Product.deleteMany({});

  return NextResponse.json({
    success: true,
    message: `Deleted ${result.deletedCount} products`,
  });
}
