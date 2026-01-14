import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import { validateSBICallback, SBI_CONFIG, SBIPaymentResponse } from "@/lib/sbi-payment";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF";
import { sendOrderConfirmationEmail } from "@/lib/email";

/**
 * POST /api/payment/sbi-callback
 * 
 * SBI Payment Gateway Callback Handler
 * 
 * CRITICAL: This endpoint receives the payment response from SBI gateway
 * after payment is processed. It MUST be publicly accessible (no authentication).
 * 
 * FLOW:
 * 1. User completes payment on SBI gateway
 * 2. SBI gateway redirects to this callback URL with encrypted payment data
 * 3. This endpoint:
 *    - Decrypts and validates the payment response
 *    - Performs double verification with SBI
 *    - Updates order status (SUCCESS/FAILED)
 *    - Updates payment record
 *    - Redirects user to appropriate page
 * 
 * SECURITY:
 * - No session/auth required (SBI gateway calls this directly)
 * - All data is encrypted by SBI
 * - Double verification with SBI prevents tampering
 * - Idempotent updates prevent duplicate processing
 * 
 * POST Body (form data):
 * - encData: Encrypted payment response from SBI
 * - merchIdVal: Merchant ID
 * - Bank_Code: Bank code (optional)
 */
export async function POST(req: NextRequest) {
  try {
    console.log('[SBI Callback] Received payment callback from SBI gateway');
    
    // Parse form data
    const formData = await req.formData();
    const encData = formData.get('encData') as string;
    const merchIdVal = formData.get('merchIdVal') as string;
    const bankCode = formData.get('Bank_Code') as string;

    // Validate required fields
    if (!encData || !merchIdVal) {
      console.error('[SBI Callback] Missing required fields:', { encData: !!encData, merchIdVal });
      return NextResponse.json(
        { success: false, message: "Invalid callback data" },
        { status: 400 }
      );
    }

    // Validate merchant ID
    if (merchIdVal !== SBI_CONFIG.MERCHANT_ID) {
      console.error('[SBI Callback] Merchant ID mismatch:', { received: merchIdVal, expected: SBI_CONFIG.MERCHANT_ID });
      return NextResponse.json(
        { success: false, message: "Invalid merchant ID" },
        { status: 400 }
      );
    }

    await connectDB();

    // Decrypt and parse the payment response
    // The validation function also performs double verification with SBI
    let paymentResponse: SBIPaymentResponse | undefined;
    let validationResult;
    
    try {
      // First, decrypt to get transaction ID
      const { decrypt, parseSBIResponse } = await import("@/lib/sbi-payment");
      const decryptedData = decrypt(SBI_CONFIG.ENCRYPTION_KEY, encData);
      paymentResponse = parseSBIResponse(decryptedData);
      
      console.log('[SBI Callback] Decrypted payment response:', {
        transactionId: paymentResponse.transactionId,
        status: paymentResponse.status,
        amount: paymentResponse.amount,
      });

      // Find the order by SBI transaction ID and populate items
      const order = await Order.findOne({ sbiTransactionId: paymentResponse.transactionId })
        .populate('items.product')
        .populate('user');
      
      if (!order) {
        console.error('[SBI Callback] Order not found for transaction:', paymentResponse.transactionId);
        return NextResponse.json(
          { success: false, message: "Order not found" },
          { status: 404 }
        );
      }

      // Validate with expected amount and perform double verification
      validationResult = await validateSBICallback(
        encData,
        paymentResponse.transactionId,
        order.totalAmount
      );

      if (!validationResult.valid) {
        console.error('[SBI Callback] Validation failed:', validationResult.error);
        return NextResponse.json(
          { success: false, message: "Payment validation failed", error: validationResult.error },
          { status: 400 }
        );
      }

      // Use validated response (includes double verification status)
      paymentResponse = validationResult.response!;

      // Check if payment was already processed (idempotency check)
      if (order.paymentStatus === 'completed' && paymentResponse.status === 'SUCCESS') {
        console.log('[SBI Callback] Payment already processed for order:', order.orderId);
        // Return success but don't process again
        return redirectToFrontend(order.orderId, 'success', paymentResponse.transactionId);
      }

      // Find the payment record
      const payment = await Payment.findOne({ transactionId: paymentResponse.transactionId });
      
      if (!payment) {
        console.error('[SBI Callback] Payment record not found');
        // Create a new payment record if it doesn't exist
        const newPayment = new Payment({
          order: order._id,
          user: order.user,
          gateway: "sbi",
          transactionId: paymentResponse.transactionId,
          amount: parseFloat(paymentResponse.amount),
          currency: "INR",
          status: paymentResponse.status === 'SUCCESS' ? 'success' : 'failed',
          metadata: paymentResponse,
          completedAt: paymentResponse.status === 'SUCCESS' ? new Date() : undefined,
        });
        await newPayment.save();
      } else {
        // Update existing payment record
        payment.status = paymentResponse.status === 'SUCCESS' ? 'success' : 'failed';
        payment.metadata = paymentResponse;
        payment.completedAt = paymentResponse.status === 'SUCCESS' ? new Date() : undefined;
        await payment.save();
      }

      // Update order based on payment status
      if (paymentResponse.status === 'SUCCESS') {
        // Payment successful
        order.paymentStatus = 'completed';
        order.orderStatus = 'confirmed';
        order.paidAt = new Date();
        order.paymentDetails = {
          bankRefNo: paymentResponse.bankRefNo,
          transactionDate: paymentResponse.transactionDate,
          challanNo: paymentResponse.challanNo,
          totalFee: paymentResponse.totalFee,
          gst: paymentResponse.gst,
          atrn: paymentResponse.atrn,
        };
        
        console.log('[SBI Callback] Payment SUCCESS - Order updated:', order.orderId);
        
        // Generate invoice number if not exists
        if (!order.invoiceNumber) {
          const date = new Date();
          const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
          const random = Math.floor(10000 + Math.random() * 90000);
          order.invoiceNumber = `INV-${dateStr}-${random}`;
        }

        // Generate and save invoice PDF
        try {
          const invoiceFilename = await generateInvoicePDF(order);
          order.invoiceUrl = invoiceFilename;
          console.log('[SBI Callback] Invoice generated:', invoiceFilename);
        } catch (invoiceError) {
          console.error('[SBI Callback] Error generating invoice:', invoiceError);
          // Don't fail the payment if invoice generation fails
        }

        // Save order with invoice before sending email
        await order.save();

        // Send order confirmation email
        try {
          await sendOrderConfirmationEmail(order);
          console.log('[SBI Callback] Order confirmation email sent to:', shippingAddress.email);
        } catch (emailError) {
          console.error('[SBI Callback] Error sending confirmation email:', emailError);
          // Don't fail the payment if email sending fails
        }
        
      } else if (paymentResponse.status === 'FAIL' || paymentResponse.status === 'FAILURE') {
        // Payment failed
        order.paymentStatus = 'failed';
        order.orderStatus = 'payment_failed';
        order.paymentDetails = {
          bankRefNo: paymentResponse.bankRefNo,
          transactionDate: paymentResponse.transactionDate,
          failureReason: 'Payment declined by gateway',
        };
        
        console.log('[SBI Callback] Payment FAILED - Order updated:', order.orderId);
        
      } else {
        // Payment pending or unknown status
        order.paymentStatus = 'pending';
        order.paymentDetails = {
          status: paymentResponse.status,
          lastChecked: new Date().toISOString(),
        };
        
        console.log('[SBI Callback] Payment PENDING - Order status:', paymentResponse.status);
      }

      // Save order if not already saved (for non-success cases)
      if (paymentResponse.status !== 'SUCCESS') {
        await order.save();
      }

      // Redirect user to appropriate page
      const redirectStatus = paymentResponse.status === 'SUCCESS' ? 'success' : 'failure';
      return redirectToFrontend(order.orderId, redirectStatus, paymentResponse.transactionId);

    } catch (error) {
      console.error('[SBI Callback] Error processing payment callback:', error);
      
      // Try to find order and mark as error
      try {
        if (paymentResponse?.transactionId) {
          const order = await Order.findOne({ sbiTransactionId: paymentResponse.transactionId });
          if (order) {
            order.paymentStatus = 'failed';
            order.orderStatus = 'payment_error';
            order.paymentDetails = {
              error: error instanceof Error ? error.message : 'Unknown error',
              errorTime: new Date().toISOString(),
            };
            await order.save();
          }
        }
      } catch (updateError) {
        console.error('[SBI Callback] Failed to update order after error:', updateError);
      }

      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to process payment callback",
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[SBI Callback] Fatal error:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Helper function to redirect user to frontend with payment result
 */
function redirectToFrontend(
  orderId: string,
  status: 'success' | 'failure',
  transactionId: string | null | undefined = undefined
) {
  const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUrl = new URL('/order/success', frontendUrl);
  
  redirectUrl.searchParams.set('orderId', orderId);
  if (transactionId) {
    redirectUrl.searchParams.set('txnId', transactionId);
  }

  console.log('[SBI Callback] Redirecting to:', redirectUrl.toString());

  // Return redirect response
  return NextResponse.redirect(redirectUrl.toString(), 303);
}

/**
 * GET /api/payment/sbi-callback
 * 
 * Handle GET requests (for testing or status checks)
 * SBI gateway uses POST, but this can be useful for debugging
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "SBI Payment Callback Endpoint",
    info: "This endpoint receives POST callbacks from SBI payment gateway",
    config: {
      merchantId: SBI_CONFIG.MERCHANT_ID,
      callbackUrl: SBI_CONFIG.CALLBACK_URL,
    }
  });
}
