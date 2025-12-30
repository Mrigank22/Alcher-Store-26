import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

/**
 * GET /api/invoice/generate?orderId=xxx
 * Get invoice URL for an order
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

    const orderId = req.nextUrl.searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findOne({ orderId }).populate("user");

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Verify user owns this order
    if (order.user.email !== session.user.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access to order" },
        { status: 403 }
      );
    }

    // Check if invoice exists
    if (!order.invoiceUrl || !order.invoiceNumber) {
      return NextResponse.json(
        { success: false, message: "Invoice not generated yet. Invoice is generated after successful payment." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        invoiceUrl: order.invoiceUrl,
        invoiceNumber: order.invoiceNumber,
        orderId: order.orderId,
      },
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}
