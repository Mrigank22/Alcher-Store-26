import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

/**
 * GET /api/orders
 * Fetch all orders for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Import User model to find user ID
    const User = (await import("@/models/User")).default;
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Find all orders for this user, sorted by most recent first
    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
