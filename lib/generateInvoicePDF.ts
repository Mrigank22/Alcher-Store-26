import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export async function generateInvoicePDF(order: any): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Create invoices directory outside public folder
      const invoicesDir = path.join(process.cwd(), "invoices");
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      // Generate PDF filename
      const pdfFileName = `invoice-${order.orderId}-${Date.now()}.pdf`;
      const pdfPath = path.join(invoicesDir, pdfFileName);

      // Create PDF document
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const stream = fs.createWriteStream(pdfPath);

      doc.pipe(stream);

      // Generate invoice content
      generateInvoiceContent(doc, order);

      doc.end();

      stream.on("finish", () => {
        resolve(pdfFileName);
      });

      stream.on("error", (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}

function generateInvoiceContent(doc: PDFKit.PDFDocument, order: any) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  // Header
  doc
    .fontSize(28)
    .fillColor("#2D5F2E")
    .text("INVOICE", { align: "center" })
    .moveDown(0.5);

  doc
    .fontSize(20)
    .fillColor("#021B05")
    .text("Alcheringa Store", { align: "center" })
    .fontSize(10)
    .fillColor("#666")
    .text("IIT Guwahati", { align: "center" })
    .moveDown(2);

  // Invoice Details - Left Side
  const leftColumn = 50;
  const rightColumn = 350;
  let currentY = doc.y;

  doc
    .fontSize(12)
    .fillColor("#2D5F2E")
    .text("Invoice Details", leftColumn, currentY)
    .fontSize(10)
    .fillColor("#333")
    .text(`Invoice No: ${order.invoiceNumber}`, leftColumn, currentY + 20)
    .text(`Order ID: ${order.orderId}`, leftColumn, currentY + 35)
    .text(`Date: ${formatDate(order.createdAt)}`, leftColumn, currentY + 50);

  // Shipping Address - Right Side
  doc
    .fontSize(12)
    .fillColor("#2D5F2E")
    .text("Ship To", rightColumn, currentY)
    .fontSize(10)
    .fillColor("#333")
    .text(order.shippingAddress.name, rightColumn, currentY + 20)
    .text(order.shippingAddress.addressLine1, rightColumn, currentY + 35)
    .text(
      `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}`,
      rightColumn,
      currentY + 50
    )
    .text(order.shippingAddress.phone, rightColumn, currentY + 65);

  doc.moveDown(4);

  // Items Table Header
  const tableTop = doc.y + 20;
  doc
    .fontSize(11)
    .fillColor("#FFFFFF")
    .rect(50, tableTop, 495, 25)
    .fill("#2D5F2E");

  doc
    .fillColor("#FFFFFF")
    .text("Item", 60, tableTop + 7, { width: 200 })
    .text("Size", 270, tableTop + 7, { width: 50 })
    .text("Qty", 330, tableTop + 7, { width: 50 })
    .text("Price", 390, tableTop + 7, { width: 70 })
    .text("Total", 470, tableTop + 7, { width: 70 });

  // Items
  let yPosition = tableTop + 30;
  doc.fillColor("#333").fontSize(10);

  order.items.forEach((item: any) => {
    doc
      .text(item.product?.name || "Product", 60, yPosition, { width: 200 })
      .text(item.size || "-", 270, yPosition, { width: 50 })
      .text(item.quantity.toString(), 330, yPosition, { width: 50 })
      .text(formatCurrency(item.price), 390, yPosition, { width: 70 })
      .text(formatCurrency(item.price * item.quantity), 470, yPosition, {
        width: 70,
      });

    yPosition += 25;
  });

  // Line separator
  doc
    .strokeColor("#ddd")
    .lineWidth(1)
    .moveTo(50, yPosition + 10)
    .lineTo(545, yPosition + 10)
    .stroke();

  // Totals
  yPosition += 30;
  const totalsX = 400;

  doc
    .fontSize(10)
    .fillColor("#333")
    .text("Subtotal:", totalsX, yPosition, { width: 70, align: "right" })
    .text(formatCurrency(order.subtotal), totalsX + 75, yPosition, {
      width: 70,
      align: "right",
    });

  yPosition += 20;
  doc
    .text("Tax (18%):", totalsX, yPosition, { width: 70, align: "right" })
    .text(formatCurrency(order.tax), totalsX + 75, yPosition, {
      width: 70,
      align: "right",
    });

  yPosition += 20;
  doc
    .text("Shipping:", totalsX, yPosition, { width: 70, align: "right" })
    .text(formatCurrency(order.shippingCost || 0), totalsX + 75, yPosition, {
      width: 70,
      align: "right",
    });

  yPosition += 25;
  doc
    .strokeColor("#2D5F2E")
    .lineWidth(2)
    .moveTo(totalsX, yPosition)
    .lineTo(545, yPosition)
    .stroke();

  yPosition += 15;
  doc
    .fontSize(14)
    .fillColor("#2D5F2E")
    .text("Total:", totalsX, yPosition, { width: 70, align: "right" })
    .text(formatCurrency(order.totalAmount), totalsX + 75, yPosition, {
      width: 70,
      align: "right",
    });

  // Footer
  doc
    .fontSize(8)
    .fillColor("#666")
    .text(
      "Thank you for your order!",
      50,
      doc.page.height - 100,
      { align: "center", width: 495 }
    )
    .text(
      "For any queries, contact us at support@alcheringa.in",
      50,
      doc.page.height - 85,
      { align: "center", width: 495 }
    );
}
