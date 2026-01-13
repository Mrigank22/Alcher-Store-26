import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import { generateEncryptedTransaction, SBI_CONFIG } from "@/lib/sbi-payment";

/**
 * POST /api/payment/sbi-create
 * 
 * Create an SBI payment order
 * This endpoint prepares the order and generates encrypted transaction data
 * for SBI payment gateway.
 * 
 * FLOW:
 * 1. User completes cart and creates order (order is in PENDING state)
 * 2. This endpoint generates encrypted SBI payment data
 * 3. Frontend redirects to cards_portal (alcheringa.iitg.ac.in) with this data
 * 4. cards_portal submits the form to SBI gateway
 * 5. SBI gateway processes payment and calls back to Alcher_Store backend
 * 
 * Body: { 
 *   orderId: string,
 *   paymentMode?: 'UPI' | 'NET_BANKING' | 'DEBIT_CARD' | 'CREDIT_CARD'
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { orderId, paymentMode = 'UPI' } = body;

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

    // Check if order is already paid
    if (order.paymentStatus === "completed") {
      return NextResponse.json(
        { success: false, message: "Order already paid" },
        { status: 400 }
      );
    }

    // Generate unique transaction ID for SBI
    // Format: ALST_ + order number + timestamp
    const sbiTransactionId = `ALST_${order.orderId}_${Date.now()}`;
    
    // Generate encrypted transaction data
    const encryptedTrans = generateEncryptedTransaction(
      sbiTransactionId,
      order.totalAmount,
      paymentMode as any
    );

    // Update order with SBI transaction details
    order.sbiTransactionId = sbiTransactionId;
    order.paymentMethod = 'sbi';
    order.paymentGateway = 'SBI';
    await order.save();

    // Create payment record with PENDING status
    const payment = new Payment({
      order: order._id,
      user: user._id,
      gateway: "sbi",
      transactionId: sbiTransactionId,
      amount: order.totalAmount,
      currency: "INR",
      status: "created",
      metadata: {
        paymentMode,
        createdAt: new Date().toISOString(),
      }
    });
    await payment.save();

    // Log the payment initiation
    console.log(`[SBI Payment] Created transaction for Order ${order.orderId}:`, {
      sbiTransactionId,
      amount: order.totalAmount,
      paymentMode,
      orderId: order._id,
    });

    /**
     * Return data needed for cards_portal to submit to SBI
     * 
     * Frontend should redirect to alcheringa.iitg.ac.in/store with this data
     * cards_portal will use the approved domain to submit the form to SBI gateway
     */
    return NextResponse.json({
      success: true,
      data: {
        EncryptTrans: encryptedTrans,
        merchIdVal: SBI_CONFIG.MERCHANT_ID,
        sbiTransactionId: sbiTransactionId,
        orderNumber: order.orderId,
        amount: order.totalAmount,
        // URL for cards_portal payment page (alcheringa.iitg.ac.in/store)
        cardsPortalUrl: SBI_CONFIG.CARDS_PORTAL_URL,
        // SBI gateway URL (for reference)
        sbiGatewayUrl: SBI_CONFIG.GATEWAY_URL,
      },
      message: "Payment order created successfully"
    });

  } catch (error) {
    console.error("Error creating SBI payment:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to create payment order",
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payment/sbi-create?orderId=xxx
 * 
 * Get SBI payment details for an existing order
 * Used when user wants to retry payment
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

    // Return existing payment details if available
    return NextResponse.json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderId,
        amount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        sbiTransactionId: order.sbiTransactionId,
        canRetryPayment: order.paymentStatus !== 'completed',
      }
    });

  } catch (error) {
    console.error("Error fetching SBI payment details:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch payment details" },
      { status: 500 }
    );
  }
}
