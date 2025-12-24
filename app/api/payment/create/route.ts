import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import Razorpay from "razorpay";

/**
 * Initialize Razorpay instance
 * Make sure to add these to your .env file:
 * RAZORPAY_KEY_ID=your_key_id
 * RAZORPAY_KEY_SECRET=your_key_secret
 * NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id (for frontend)
 */
const razorpay = process.env.RAZORPAY_KEY_ID
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
  : null;

/**
 * POST /api/payment/create
 * Create a Razorpay order for payment
 * Body: { orderId: string, mockMode?: boolean }
 * 
 * Set mockMode=true for testing without real payment
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { orderId, mockMode = false } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
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

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Verify order belongs to user
    if (order.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access to order" },
        { status: 403 }
      );
    }

    // Check if order is already paid
    if (order.paymentStatus === "completed") {
      return NextResponse.json(
        { success: false, message: "Order already paid" },
        { status: 400 }
      );
    }

    // MOCK MODE - For testing without real payment
    if (mockMode) {
      const mockRazorpayOrderId = `mock_order_${Date.now()}`;
      
      order.razorpayOrderId = mockRazorpayOrderId;
      order.paymentMethod = "mock";
      await order.save();

      // Create payment record
      const payment = new Payment({
        order: order._id,
        user: user._id,
        gateway: "mock",
        razorpayOrderId: mockRazorpayOrderId,
        amount: order.totalAmount,
        currency: "INR",
        status: "created",
      });
      await payment.save();

      return NextResponse.json({
        success: true,
        mockMode: true,
        data: {
          orderId: mockRazorpayOrderId,
          amount: order.totalAmount,
          currency: "INR",
          orderNumber: order.orderId,
        },
      });
    }

    // REAL RAZORPAY INTEGRATION
    if (!razorpay) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET",
        },
        { status: 500 }
      );
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: order.totalAmount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: order.orderId,
      notes: {
        orderNumber: order.orderId,
        userId: user._id.toString(),
      },
    });

    // Update order with Razorpay order ID
    order.razorpayOrderId = razorpayOrder.id;
    order.paymentMethod = "razorpay";
    await order.save();

    // Create payment record
    const payment = new Payment({
      order: order._id,
      user: user._id,
      gateway: "razorpay",
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalAmount,
      currency: "INR",
      status: "created",
    });
    await payment.save();

    return NextResponse.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        orderNumber: order.orderId,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Send key for frontend
      },
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
