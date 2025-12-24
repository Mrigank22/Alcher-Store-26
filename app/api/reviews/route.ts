import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Reviews";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();

    if (
      !data?.product_id ||
      !data?.content ||
      !data?.rating ||
      !data?.userName
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const review = await Review.create({
      product_id: data.product_id,   
      content: data.content,
      rating: data.rating,
      userId: data.userId || null, 
      userName: data.userName,       
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    console.error("REVIEW CREATE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const product_id = searchParams.get("productId");

    if (!product_id) {
      return NextResponse.json([], { status: 200 });
    }

    const reviews = await Review.find({ product_id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(reviews, { status: 200 });
  } catch (err) {
    console.error("REVIEW FETCH ERROR:", err);
    return NextResponse.json([], { status: 200 });
  }
}
