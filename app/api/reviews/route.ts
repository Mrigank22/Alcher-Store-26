import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Reviews";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();

    let data: any;
    const contentType = req.headers.get("content-type") || "";

    // Handle multipart/form-data from Payload admin
    if (contentType.includes("multipart/form-data")) {
      try {
        const formData = await req.formData();
        const payloadField = formData.get("_payload");
        
        if (!payloadField || typeof payloadField !== "string") {
          return NextResponse.json(
            { error: "Missing _payload field in form data" },
            { status: 400 }
          );
        }
        
        data = JSON.parse(payloadField);
      } catch (parseErr) {
        console.error("REVIEW CREATE ERROR: invalid form data or _payload JSON:", parseErr);
        return NextResponse.json(
          { error: "Invalid form data or _payload field" },
          { status: 400 }
        );
      }
    } else {
      // Handle raw JSON body
      const raw = await req.text();
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch (parseErr) {
        console.error("REVIEW CREATE ERROR: invalid JSON body:", parseErr, "raw=", raw);
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
      }
    }

    if (
      !data?.product_id ||
      !data?.content ||
      (data.rating === undefined || data.rating === null) ||
      !data?.userName
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Normalize/validate fields
    const rating = Number(data.rating);
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating value" }, { status: 400 });
    }

    const review = await Review.create({
      product_id: String(data.product_id),
      content: String(data.content),
      rating,
      userId: data.userId || null,
      userName: String(data.userName),
      userImage: data.userImage || null,
    });

    // Transform _id to id for Payload admin compatibility
    const responseData = {
      ...review.toObject(),
      id: review._id.toString(),
    };

    return NextResponse.json(responseData, { status: 201 });
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

    // if (!product_id) {
    //   return NextResponse.json([], { status: 200 });
    // }

    // const reviews = await Review.find({ product_id })
    //   .sort({ createdAt: -1 })
    //   .lean();

    let reviews;

    if (product_id) {
      reviews = await Review.find({ product_id })
        .sort({ createdAt: -1 })
        .lean();
    } else {
      reviews = await Review.find()
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();
    }
    return NextResponse.json(reviews, { status: 200 });
  } catch (err) {
    console.error("REVIEW FETCH ERROR:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("where[and][0][id][in][0]");
    
    // Payload sends IDs as separate query params: where[and][0][id][in][0], where[and][0][id][in][1], etc.
    // Collect all IDs from the query string
    const ids: string[] = [];
    searchParams.forEach((value, key) => {
      if (key.match(/where\[and\]\[0\]\[id\]\[in\]\[\d+\]/)) {
        ids.push(value);
      }
    });

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "No review IDs provided" },
        { status: 400 }
      );
    }

    const result = await Review.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({
      message: `Deleted ${result.deletedCount} review(s)`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("REVIEW DELETE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to delete review(s)" },
      { status: 500 }
    );
  }
}
