import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";
import { sendOrderConfirmationEmail } from "@/lib/email";

/**
 * POST /api/payment/verify
 * Verify Razorpay payment signature and update order status
 * Body: {
 *   razorpay_order_id: string,
 *   razorpay_payment_id: string,
 *   razorpay_signature: string,
 *   mockMode?: boolean
 * }
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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      mockMode = false,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { success: false, message: "Missing payment details" },
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

    // Find order by Razorpay order ID
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Verify order belongs to user
    if (order.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Find payment record
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment record not found" },
        { status: 404 }
      );
    }

    // MOCK MODE - Skip signature verification
    if (mockMode || order.paymentMethod === "mock") {
      // Simulate successful payment
      order.status = "confirmed";
      order.paymentStatus = "completed";
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = "mock_signature";
      order.paymentDate = new Date();

      // Generate invoice number if not exists
      if (!order.invoiceNumber) {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
        const random = Math.floor(10000 + Math.random() * 90000);
        order.invoiceNumber = `INV-${dateStr}-${random}`;
      }

      payment.status = "success";
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = "mock_signature";
      payment.completedAt = new Date();

      await order.save();
      await payment.save();

      // Generate and save invoice PDF
      try {
        const invoiceUrl = await generateInvoicePDF(order);
        order.invoiceUrl = invoiceUrl;
        await order.save();
      } catch (invoiceError) {
        console.error("Error generating invoice:", invoiceError);
        // Don't fail the payment if invoice generation fails
      }

      // Clear user's cart
      await Cart.findOneAndUpdate(
        { user_email: session.user.email },
        { items: [], total_quantity: 0, total_price: 0 }
      );

      // Reduce stock (optional)
      await reduceStock(order);

      // Send order confirmation email
      try {
        await sendOrderConfirmationEmail(order);
      } catch (emailError) {
        console.error("Error sending order confirmation email:", emailError);
        // Don't fail the payment if email fails
      }

      return NextResponse.json({
        success: true,
        mockMode: true,
        message: "Mock payment verified successfully",
        data: {
          orderId: order.orderId,
          status: order.status,
        },
      });
    }

    // REAL RAZORPAY SIGNATURE VERIFICATION
    if (!razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Payment signature missing" },
        { status: 400 }
      );
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      // Invalid signature - payment failed
      order.status = "payment_failed";
      order.paymentStatus = "failed";
      payment.status = "failed";
      payment.errorDescription = "Invalid payment signature";

      await order.save();
      await payment.save();

      return NextResponse.json(
        {
          success: false,
          message: "Payment verification failed. Invalid signature.",
        },
        { status: 400 }
      );
    }

    // Payment verified successfully
    order.status = "confirmed";
    order.paymentStatus = "completed";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentDate = new Date();

    // Generate invoice number if not exists
    if (!order.invoiceNumber) {
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
      const random = Math.floor(10000 + Math.random() * 90000);
      order.invoiceNumber = `INV-${dateStr}-${random}`;
    }

    payment.status = "success";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.completedAt = new Date();

    await order.save();
    await payment.save();

    // Generate and save invoice PDF
    try {
      const invoiceUrl = await generateInvoicePDF(order);
      order.invoiceUrl = invoiceUrl;
      await order.save();
    } catch (invoiceError) {
      console.error("Error generating invoice:", invoiceError);
      // Don't fail the payment if invoice generation fails
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user_email: session.user.email },
      { items: [], total_quantity: 0, total_price: 0 }
    );

    // Reduce stock quantities
    await reduceStock(order);

    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail(order);
    } catch (emailError) {
      console.error("Error sending order confirmation email:", emailError);
      // Don't fail the payment if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      data: {
        orderId: order.orderId,
        status: order.status,
        paymentId: razorpay_payment_id,
      },
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to verify payment" },
      { status: 500 }
    );
  }
}

/**
 * Helper function to reduce stock after successful payment
 */
async function reduceStock(order: any) {
  try {
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      
      if (!product) continue;

      // Find the variant matching size/color
      const variantIndex = product.variants.findIndex(
        (v: any) => 
          (!product.hasSize || v.size === item.size) &&
          (!product.hasColor || v.color === item.colour)
      );

      if (variantIndex !== -1) {
        product.variants[variantIndex].stock = Math.max(
          0,
          product.variants[variantIndex].stock - item.quantity
        );
        await product.save();
      }
    }
  } catch (error) {
    console.error("Error reducing stock:", error);
    // Don't fail the payment verification if stock update fails
    // Log this for manual review
  }
}

/**
 * GET /api/payment/verify
 * Get payment status for an order
 * Query: ?orderId=xxx
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

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

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

    const payment = await Payment.findOne({ order: orderId }).populate("order");

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    // Verify payment belongs to user
    if (payment.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch payment" },
      { status: 500 }
    );
  }
}
