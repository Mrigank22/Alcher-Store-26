import nodemailer from "nodemailer";

// Create a transporter using your email service
// For production, use your actual email service credentials
const transporter = nodemailer.createTransport({
  service: "gmail", // or your email service
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASSWORD, // Your email password or app password
  },
});

export async function sendOTPEmail(email: string, otp: string) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Registration",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Your OTP for registration is:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #666;">This OTP will expire in 10 minutes.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export async function sendOrderConfirmationEmail(order: any) {
  const { shippingAddress, orderId, orderDate, items, subtotal, shippingCost, tax, totalAmount, invoiceUrl } = order;
  
  const itemsHTML = items.map((item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.productName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.size || "N/A"}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.subtotal.toFixed(2)}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: shippingAddress.email,
    subject: `Order Confirmation - ${orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2D5F2E; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #ffffff; padding: 30px; border: 1px solid #ddd; }
          .success-badge { background-color: #D4E8D4; color: #2D5F2E; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 20px 0; }
          .order-details { background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th { background-color: #2D5F2E; color: white; padding: 12px; text-align: left; }
          .items-table td { padding: 10px; border-bottom: 1px solid #ddd; }
          .totals { margin-top: 20px; text-align: right; }
          .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .total-amount { font-size: 20px; font-weight: bold; color: #2D5F2E; border-top: 2px solid #2D5F2E; padding-top: 10px; margin-top: 10px; }
          .button { background-color: #2D5F2E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">ALCHER STORE</h1>
            <p style="margin: 10px 0 0 0;">Order Confirmation</p>
          </div>
          
          <div class="content">
            <div style="text-align: center;">
              <span class="success-badge">✅ ORDER CONFIRMED</span>
            </div>
            
            <p>Dear ${shippingAddress.name},</p>
            <p>Thank you for your order! Your items are being packed and will be shipped soon.</p>
            
            <div class="order-details">
              <h3 style="margin-top: 0; color: #2D5F2E;">Order Details</h3>
              <p><strong>Order Number:</strong> ${orderId}</p>
              <p><strong>Order Date:</strong> ${new Date(orderDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Payment Status:</strong> <span style="color: #2D5F2E; font-weight: bold;">COMPLETED</span></p>
            </div>
            
            <h3 style="color: #2D5F2E;">Shipping Address</h3>
            <p>
              ${shippingAddress.name}<br>
              ${shippingAddress.addressLine1}<br>
              ${shippingAddress.addressLine2 ? `${shippingAddress.addressLine2}<br>` : ''}
              ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}<br>
              Phone: ${shippingAddress.phone}
            </p>
            
            <h3 style="color: #2D5F2E;">Order Items</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style="text-align: center;">Size</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                  <th style="text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
            
            <div class="totals">
              <div style="max-width: 300px; margin-left: auto;">
                <div class="totals-row">
                  <span>Subtotal:</span>
                  <span>₹${subtotal.toFixed(2)}</span>
                </div>
                <div class="totals-row">
                  <span>Shipping:</span>
                  <span>${shippingCost === 0 ? 'FREE' : `₹${shippingCost.toFixed(2)}`}</span>
                </div>
                <div class="totals-row">
                  <span>Tax (GST):</span>
                  <span>₹${tax.toFixed(2)}</span>
                </div>
                <div class="totals-row total-amount">
                  <span>Total Amount:</span>
                  <span>₹${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            ${invoiceUrl ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${invoiceUrl}" style="background-color: #2D5F2E; color: #ffffff !important; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500;">Download Invoice</a>
              </div>
            ` : ''}
            
            <div style="background-color: #f0f9f0; padding: 15px; border-radius: 8px; margin-top: 30px;">
              <p style="margin: 0;"><strong>Track Your Order:</strong></p>
              <p style="margin: 5px 0 0 0;">You can track your order status by logging into your account.</p>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Thank you for shopping with Alcher Store!</strong></p>
            <p>For any queries, please contact us at support@alcherstore.com</p>
            <p>&copy; ${new Date().getFullYear()} Alcher Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return { success: false, error };
  }
}
