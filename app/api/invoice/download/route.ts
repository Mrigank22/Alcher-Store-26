import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import fs from "fs";
import path from "path";

/**
 * GET /api/invoice/download?orderId=xxx
 * Download invoice PDF for an order
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
    if (!order.invoiceUrl) {
      return NextResponse.json(
        { success: false, message: "Invoice not generated yet" },
        { status: 404 }
      );
    }

    // Get the invoice file path
    const invoicesDir = path.join(process.cwd(), "invoices");
    const invoicePath = path.join(invoicesDir, order.invoiceUrl);

    // Check if file exists
    if (!fs.existsSync(invoicePath)) {
      return NextResponse.json(
        { success: false, message: "Invoice file not found" },
        { status: 404 }
      );
    }

    // Read the PDF file
    const pdfBuffer = fs.readFileSync(invoicePath);

    // Return the PDF file
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${orderId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error downloading invoice:", error);
    return NextResponse.json(
      { success: false, message: "Failed to download invoice" },
      { status: 500 }
    );
  }
}
