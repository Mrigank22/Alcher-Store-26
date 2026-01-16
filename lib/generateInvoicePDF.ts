import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import SVGtoPDF from "svg-to-pdfkit";

export async function generateInvoicePDF(order: any): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      console.log('[Invoice Generation] Starting PDF generation for order:', order.orderId);
      console.log('[Invoice Generation] Process CWD:', process.cwd());
      console.log('[Invoice Generation] Process user:', process.env.USER || process.env.USERNAME || 'unknown');
      
      // Create invoices directory outside public folder
      const invoicesDir = path.join(process.cwd(), "invoices");
      console.log('[Invoice Generation] Target directory:', invoicesDir);
      
      try {
        if (!fs.existsSync(invoicesDir)) {
          fs.mkdirSync(invoicesDir, { recursive: true });
          console.log('[Invoice Generation] Created invoices directory');
        } else {
          console.log('[Invoice Generation] Directory already exists');
        }
        
        // Test write permissions
        const testFile = path.join(invoicesDir, '.test-write');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        console.log('[Invoice Generation] Directory is writable');
      } catch (dirError) {
        console.error('[Invoice Generation] Directory/permission error:', dirError);
        reject(new Error(`Cannot access invoices directory: ${dirError}`));
        return;
      }

      // Generate PDF filename
      const pdfFileName = `invoice-${order.orderId}-${Date.now()}.pdf`;
      const pdfPath = path.join(invoicesDir, pdfFileName);
      console.log('[Invoice Generation] PDF will be saved to:', pdfPath);

      // Create PDF document with standard embedded fonts (no external .afm files needed)
      // Use 'Courier' as the base font - it's a standard PDF font embedded in PDFKit
      const doc = new PDFDocument({ 
        margin: 50, 
        size: "A4",
        bufferPages: true,
        font: 'Courier'  // Set default font in constructor to prevent Helvetica loading
      });
      
      const stream = fs.createWriteStream(pdfPath);

      doc.pipe(stream);

      // Add logo watermark in background (embedded SVG - no filesystem dependency)
      try {
        const logoSVG = `<svg width="140" height="53" viewBox="0 0 140 53" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12.5787 12.7695C11.3583 20.5761 10.3146 27.3722 9.35017 32.8566C8.1492 39.691 6.82854 44.33 4.20811 45.8544C3.63615 43.6088 0.975358 43.1267 0.285111 44.9561C-1.0759 48.5596 5.3409 50.7074 8.1492 46.9877C11.7674 42.1941 11.8969 36.9673 12.7416 33.805C13.8284 33.8261 14.9292 33.7892 16.0147 33.8116C16.2735 35.3307 16.2234 39.0147 17.3618 41.992C18.162 44.0843 19.7025 45.9178 21.8136 46.7671C22.2645 46.9494 25.6934 47.6878 27.9604 46.5492C29.0946 45.9798 30.2622 45.1028 30.6407 43.1254C31.0234 41.1229 30.1926 38.4044 26.2863 38.3463C24.3171 38.3172 23.748 40.2577 23.8649 41.0317C24.0736 42.4121 25.5501 43.2931 27.3801 42.8017C26.8958 43.2297 26.7205 43.5599 25.8284 43.7885C24.9851 44.0051 24.0305 43.8585 23.4905 43.622C21.5923 42.7938 21.1136 41.4703 20.6154 40.3039C19.0025 36.5208 18.3303 13.1116 18.3637 13.031C17.8989 13.0482 14.7747 12.8395 12.5787 12.7695Z" fill="#F4FBF4"/>
</svg>`;
        // Add watermark in center with low opacity
        // A4 page is 595x842 points, center the logo
        doc.save();
        doc.opacity(0.08); // 8% opacity for subtle but visible watermark
        SVGtoPDF(doc, logoSVG, 150, 320, {
          width: 300, // Larger size for better visibility
          height: 300,
          preserveAspectRatio: 'xMidYMid meet'
        });
        doc.opacity(1);
        doc.restore();
      } catch (logoError) {
        console.log('[Invoice Generation] Could not add logo watermark:', logoError);
      }

      // Generate invoice content
      generateInvoiceContent(doc, order);

      doc.end();

      stream.on("finish", () => {
        console.log('[Invoice Generation] PDF generated successfully:', pdfFileName);
        resolve(pdfFileName);
      });

      stream.on("error", (err) => {
        console.error('[Invoice Generation] Stream error:', err);
        reject(err);
      });
    } catch (error) {
      console.error('[Invoice Generation] Fatal error:', error);
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
    return `Rs. ${amount.toFixed(2)}`;
  };

  // Don't set any font - PDFKit will use default embedded font
  // This avoids font file loading issues in production
  
  // Header
  doc
    .fontSize(28)
    .fillColor("#2D5F2E")
    .text("INVOICE", { align: "center" })
    .moveDown(0.5);

  doc
    .fontSize(20)
    .fillColor("#000000")
    .text("Alcheringa Store", { align: "center" })
    .fontSize(10)
    .fillColor("#333333")
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
    .fillColor("#000000")
    .text(`Invoice No: ${order.invoiceNumber}`, leftColumn, currentY + 20)
    .text(`Order ID: ${order.orderId}`, leftColumn, currentY + 35)
    .text(`Date: ${formatDate(order.createdAt)}`, leftColumn, currentY + 50);

  // Shipping Address - Right Side
  doc
    .fontSize(12)
    .fillColor("#2D5F2E")
    .text("Ship To", rightColumn, currentY)
    .fontSize(10)
    .fillColor("#000000")
    .text(order.shippingAddress.name, rightColumn, currentY + 20)
    .text(order.shippingAddress.addressLine1, rightColumn, currentY + 35)
    .text(
      `${order.shippingAddress.city}, ${order.shippingAddress.state}`,
      rightColumn,
      currentY + 50
    )
    .text(`${order.shippingAddress.pincode}`, rightColumn, currentY + 65)
    .text(order.shippingAddress.phone, rightColumn, currentY + 80);

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
  doc.fillColor("#000000").fontSize(10);

  if (!order.items || order.items.length === 0) {
    doc.text("No items in order", 60, yPosition, { width: 485, align: "center" });
    yPosition += 25;
  }

  (order.items || []).forEach((item: any) => {
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
    .fillColor("#000000")
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
