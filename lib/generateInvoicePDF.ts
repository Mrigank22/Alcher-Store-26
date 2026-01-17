import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

/**
 * Generate invoice PDF matching exact design
 */
export async function generateInvoicePDF(order: any): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 0,
      });

      const filename = `invoice-${order.orderId}-${Date.now()}.pdf`;
      const invoicesDir = path.join(process.cwd(), "invoices");

      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const invoicePath = path.join(invoicesDir, filename);
      const writeStream = fs.createWriteStream(invoicePath);

      doc.pipe(writeStream);
      generateInvoiceContent(doc, order);
      doc.end();

      writeStream.on("finish", () => resolve(filename));
      writeStream.on("error", (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
}

function generateInvoiceContent(doc: PDFKit.PDFDocument, order: any) {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  
  // Header with dark green background
  doc.rect(0, 0, pageWidth, 100).fill("#021B05");

  // Logo on left
  const logoPath = path.join(process.cwd(), "public", "footer-icon.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 20, 25, { width: 50, height: 50 });
  }

  // Text next to logo
  doc
    .font("Helvetica")
    .fontSize(6)
    .fillColor("#FFFFFF")
    .text("IIT Guwahati's", 80, 30)
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("Alcheringa", 80, 42)
    .font("Helvetica")
    .fontSize(9)
    .text("2026", 80, 60);

  // Header text on right
  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor("#FFFFFF")
    .text("Alcher Store", 400, 30, { align: "right", width: 175 });

  doc
    .font("Helvetica")
    .fontSize(9)
    .text("Ph.No.: +91 70606 33995", 400, 52, { align: "right", width: 175 })
    .text("Email ID: creatives@alcheringa.co.in", 400, 68, { align: "right", width: 175 });

  // Invoice details section
  const sectionTop = 130;
  
  // Invoice To (Left)
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#000000")
    .text("Invoice To:", 20, sectionTop);
  
  const customerName = order.shippingAddress?.name || order.customerName || "Recipient's Name";
  const addressLine1 = order.shippingAddress?.addressLine1 || order.shippingAddress?.street || "";
  const addressLine2 = order.shippingAddress?.addressLine2 || "";
  const fullAddress = [addressLine1, addressLine2].filter(Boolean).join(", ");
  
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(customerName, 20, sectionTop + 20, { width: 180 });
  
  doc
    .font("Helvetica")
    .fontSize(9)
    .text(fullAddress || "Address", 20, sectionTop + 35, { width: 180 })
    .text(order.shippingAddress?.district && order.shippingAddress?.city && order.shippingAddress?.state 
      ? `${order.shippingAddress.district}, ${order.shippingAddress.city}, ${order.shippingAddress.state}` 
      : "", 20, sectionTop + 48, { width: 180 });

  // Payment Details (Middle)
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("Payment Details:", 223, sectionTop);
  
  const paymentMethod = order.paymentMethod || "SBI";
  const transactionId = order.sbiTransactionId || order.paymentDetails?.bankRefNo || "N/A";
  const atrn = order.paymentDetails?.atrn || "";
  
  doc
    .font("Helvetica")
    .fontSize(9)
    .text(`Payment Mode: ${paymentMethod}`, 223, sectionTop + 20, { width: 170 });
  
  doc
    .text(`Transaction ID: ${transactionId}`, 223, sectionTop + 35, { width: 170 });
  
  if (atrn) {
    doc.text(`ATRN: ${atrn}`, 223, sectionTop + 55, { width: 170 });
  }

  // Order ID and date (Right)
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(order.orderId, 420, sectionTop, { align: "right", width: 155 });
  
  doc
    .font("Helvetica")
    .fontSize(9)
    .text(formatDate(order.orderDate), 420, sectionTop + 20, { align: "right", width: 155 });

  // Items table
  const tableTop = 225;
  
  // Table header
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("#000000")
    .text("ITEM DESCRIPTION", 27, tableTop)
    .text("PRICE", 285, tableTop, { width: 80, align: "center" })
    .text("QTY", 375, tableTop, { width: 40, align: "center" })
    .text("TOTAL", 485, tableTop, { align: "right", width: 90 });

  // Horizontal line under header
  doc
    .strokeColor("#CCCCCC")
    .lineWidth(0.5)
    .moveTo(20, tableTop + 13)
    .lineTo(575, tableTop + 13)
    .stroke();

  // Table rows
  let yPos = tableTop + 25;
  
  order.items.forEach((item: any) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#000000")
      .text(item.productName, 27, yPos, { width: 240 });

    yPos += 13;
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#666666")
      .text(`${item.productType || ''}${item.size ? `, Size ${item.size}` : ''}`, 27, yPos, { width: 240 });

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#000000")
      .text(`Rs${item.price}`, 285, yPos - 13, { width: 80, align: "center" })
      .text(item.quantity.toString(), 375, yPos - 13, { width: 40, align: "center" })
      .text(`Rs${item.subtotal}`, 485, yPos - 13, { align: "right", width: 90 });

    yPos += 28;
  });

  // Delivery Charges if shippingCost > 0
  if (order.shippingCost > 0) {
    yPos += 5;
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#000000")
      .text("Delivery Charges", 27, yPos);
    
    doc.text(`Rs${order.shippingCost}`, 485, yPos, { align: "right", width: 90 });
    
    yPos += 28;
  }

  // Horizontal line before totals
  yPos += 15;
  doc
    .strokeColor("#CCCCCC")
    .lineWidth(0.5)
    .moveTo(20, yPos)
    .lineTo(575, yPos)
    .stroke();

  // Subtotal (including delivery charge)
  yPos += 20;
  const subtotalWithDelivery = (order.subtotal || 0) + (order.shippingCost || 0);
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("SUB TOTAL", 395, yPos)
    .text(`Rs${subtotalWithDelivery}`, 485, yPos, { align: "right", width: 90 });

  // GST/TAX
  yPos += 20;
  doc
    .text("GST/TAX", 395, yPos)
    .text(`Rs${order.tax}`, 485, yPos, { align: "right", width: 90 });

  // Horizontal line before grand total
  yPos += 15;
  doc
    .strokeColor("#CCCCCC")
    .lineWidth(0.5)
    .moveTo(395, yPos)
    .lineTo(575, yPos)
    .stroke();

  // Grand Total
  yPos += 20;
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("GRAND TOTAL", 395, yPos)
    .text(`Rs${order.totalAmount}`, 485, yPos, { align: "right", width: 90 });

  // Notes section
  const notesY = 650;
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("#000000")
    .text("Notes", 27, notesY);
  
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#666666")
    .text("This is a computer-generated invoice and does not require a signature.", 27, notesY + 15);

  // Footer message
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#000000")
    .text("THANK YOU FOR SHOPPING WITH US !", 0, 710, { align: "center", width: pageWidth });
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
