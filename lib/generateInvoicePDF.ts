import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export async function generateInvoicePDF(order: any): Promise<string> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    
    const invoiceHTML = generateInvoiceHTML(order);
    await page.setContent(invoiceHTML, { waitUntil: "networkidle0" });

    // Create invoices directory if it doesn't exist
    const invoicesDir = path.join(process.cwd(), "public", "invoices");
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    // Generate PDF filename
    const pdfFileName = `invoice-${order.orderId}-${Date.now()}.pdf`;
    const pdfPath = path.join(invoicesDir, pdfFileName);

    // Generate PDF
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    // Return the public URL
    return `/invoices/${pdfFileName}`;
  } finally {
    await browser.close();
  }
}

function generateInvoiceHTML(order: any): string {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice - ${order.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      background: white;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #2D5F2E;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #2D5F2E;
      font-size: 32px;
      margin-bottom: 10px;
    }
    .company-name {
      font-size: 24px;
      font-weight: bold;
      color: #021B05;
      margin-bottom: 5px;
    }
    .invoice-details {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .invoice-details div {
      flex: 1;
    }
    .invoice-details h3 {
      color: #2D5F2E;
      margin-bottom: 10px;
      font-size: 16px;
    }
    .invoice-details p {
      margin: 5px 0;
      color: #333;
      font-size: 14px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    .items-table thead {
      background: #2D5F2E;
      color: white;
    }
    .items-table th {
      padding: 12px;
      text-align: left;
      font-weight: bold;
    }
    .items-table td {
      padding: 12px;
      border-bottom: 1px solid #ddd;
    }
    .totals {
      margin-top: 30px;
      text-align: right;
    }
    .totals table {
      margin-left: auto;
      min-width: 300px;
    }
    .totals td {
      padding: 8px 20px;
      font-size: 14px;
    }
    .totals .total-row {
      font-size: 18px;
      font-weight: bold;
      border-top: 2px solid #2D5F2E;
      color: #2D5F2E;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      color: #666;
      font-size: 12px;
      border-top: 1px solid #ddd;
      padding-top: 20px;
    }
    .status-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      background: #D4E8D4;
      color: #2D5F2E;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="company-name">ALCHER STORE</div>
      <h1>INVOICE</h1>
      <p>Invoice Number: <strong>${order.invoiceNumber}</strong></p>
    </div>

    <div class="invoice-details">
      <div>
        <h3>Invoice To:</h3>
        <p><strong>${order.shippingAddress.name}</strong></p>
        <p>${order.shippingAddress.addressLine1}</p>
        ${order.shippingAddress.addressLine2 ? `<p>${order.shippingAddress.addressLine2}</p>` : ""}
        <p>${order.shippingAddress.city}, ${order.shippingAddress.state}</p>
        <p>Pincode: ${order.shippingAddress.pincode}</p>
        <p>Phone: ${order.shippingAddress.phone}</p>
      </div>
      <div style="text-align: right;">
        <h3>Invoice Details:</h3>
        <p><strong>Order ID:</strong> ${order.orderId}</p>
        <p><strong>Date:</strong> ${formatDate(order.orderDate)}</p>
        <p><strong>Payment Status:</strong> <span class="status-badge">${order.paymentStatus}</span></p>
        ${order.paymentMethod ? `<p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>` : ""}
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Product Name</th>
          <th>Size</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${order.items
          .map(
            (item: any, index: number) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.productName}</td>
            <td>${item.size || "N/A"}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price.toFixed(2)}</td>
            <td>₹${item.subtotal.toFixed(2)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <div class="totals">
      <table>
        <tr>
          <td>Subtotal:</td>
          <td>₹${order.subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Shipping:</td>
          <td>${order.shippingCost === 0 ? "FREE" : `₹${order.shippingCost.toFixed(2)}`}</td>
        </tr>
        <tr>
          <td>Tax (GST):</td>
          <td>₹${order.tax.toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <td>Total Amount:</td>
          <td>₹${order.totalAmount.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    ${
      order.notes
        ? `
    <div style="margin-top: 30px; padding: 15px; background: #f9f9f9; border-left: 3px solid #2D5F2E;">
      <strong>Notes:</strong>
      <p style="margin-top: 5px;">${order.notes}</p>
    </div>
    `
        : ""
    }

    <div class="footer">
      <p><strong>Thank you for your purchase!</strong></p>
      <p>For any queries, please contact us at support@alcherstore.com</p>
      <p>This is a computer-generated invoice and does not require a signature.</p>
    </div>
  </div>
</body>
</html>
  `;
}
