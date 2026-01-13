import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import { doubleVerifySBIPayment } from "@/lib/sbi-payment";

/**
 * GET /api/payment/sbi-status?orderId=xxx
 * 
 * Check payment status for an order
 * This endpoint can be used by the frontend to poll payment status
 * or to verify payment after callback
 * 
 * Query params:
 * - orderId: Order ID to check
 * - verify: If 'true', performs double verification with SBI gateway
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
    const orderId = searchParams.get('orderId');
    const shouldVerify = searchParams.get('verify') === 'true';

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    
    const User = (await import("@/models/User")).default;
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Find the order
    const order = await Order.findById(orderId).populate('items.product');
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

    // Find payment record
    const payment = await Payment.findOne({ order: order._id });

    // Perform double verification with SBI if requested and transaction exists
    let verificationResult = null;
    if (shouldVerify && order.sbiTransactionId && order.totalAmount) {
      verificationResult = await doubleVerifySBIPayment(
        order.sbiTransactionId,
        order.totalAmount
      );

      // If verification shows different status, log it
      if (verificationResult.success && verificationResult.status !== order.paymentStatus) {
        console.warn('[SBI Status] Status mismatch:', {
          orderId: order.orderId,
          localStatus: order.paymentStatus,
          sbiStatus: verificationResult.status,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        order: {
          id: order._id,
          orderNumber: order.orderId,
          totalAmount: order.totalAmount,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          paidAt: order.paidAt,
          sbiTransactionId: order.sbiTransactionId,
          paymentDetails: order.paymentDetails,
          createdAt: order.createdAt,
        },
        payment: payment ? {
          id: payment._id,
          status: payment.status,
          gateway: payment.gateway,
          transactionId: payment.transactionId,
          amount: payment.amount,
          completedAt: payment.completedAt,
          gatewayResponse: payment.gatewayResponse,
        } : null,
        verification: verificationResult,
      }
    });

  } catch (error) {
    console.error("Error checking payment status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to check payment status" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payment/sbi-status
 * 
 * Manually trigger payment verification
 * Useful when payment callback fails or user closes browser
 * 
 * Body: { orderId: string }
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
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    
    const User = (await import("@/models/User")).default;
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    if (order.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access to order" },
        { status: 403 }
      );
    }

    // Can only verify if we have SBI transaction ID
    if (!order.sbiTransactionId) {
      return NextResponse.json(
        { success: false, message: "No SBI transaction found for this order" },
        { status: 400 }
      );
    }

    // Perform double verification
    const verification = await doubleVerifySBIPayment(
      order.sbiTransactionId,
      order.totalAmount
    );

    if (!verification.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to verify payment with SBI",
          error: verification.message 
        },
        { status: 500 }
      );
    }

    // Update order if status has changed
    const statusChanged = verification.status !== order.paymentStatus;
    if (statusChanged) {
      console.log('[SBI Status] Updating order status from verification:', {
        orderId: order.orderId,
        oldStatus: order.paymentStatus,
        newStatus: verification.status,
      });

      if (verification.status === 'SUCCESS') {
        order.paymentStatus = 'completed';
        order.orderStatus = 'confirmed';
        order.paidAt = new Date();
      } else if (verification.status === 'FAIL' || verification.status === 'FAILURE') {
        order.paymentStatus = 'failed';
        order.orderStatus = 'payment_failed';
      }

      order.paymentDetails = {
        ...order.paymentDetails,
        verifiedAt: new Date().toISOString(),
        verificationStatus: verification.status,
      };

      await order.save();

      // Update payment record
      const payment = await Payment.findOne({ order: order._id });
      if (payment) {
        payment.status = verification.status === 'SUCCESS' ? 'completed' : 'failed';
        payment.completedAt = verification.status === 'SUCCESS' ? new Date() : undefined;
        await payment.save();
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        verificationStatus: verification.status,
        statusChanged,
        order: {
          id: order._id,
          orderNumber: order.orderId,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
        },
      },
      message: statusChanged ? "Payment status updated" : "Payment status confirmed"
    });

  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { success: false, message: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
