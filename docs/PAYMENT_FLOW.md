# Payment Flow Documentation

## Complete E-Commerce Checkout & Payment System

This document explains the complete payment flow implemented for your Next.js + MongoDB e-commerce website.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Database Schemas](#database-schemas)
4. [API Routes](#api-routes)
5. [Payment Flow (Step-by-Step)](#payment-flow-step-by-step)
6. [Security Features](#security-features)
7. [Testing with Mock Mode](#testing-with-mock-mode)
8. [Setup Instructions](#setup-instructions)
9. [Common Issues & Solutions](#common-issues--solutions)

---

## Overview

The system implements a complete checkout flow with:
- Shopping cart management
- Order creation
- Razorpay payment integration
- Payment verification
- Order confirmation
- Stock management

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB with Mongoose
- **Payment Gateway**: Razorpay
- **Authentication**: NextAuth.js
- **Language**: TypeScript

---

## Database Schemas

### 1. Cart Schema (`models/Cart.ts`)

```typescript
{
  user: ObjectId (ref: User) - unique per user
  items: [
    {
      product: ObjectId (ref: Product)
      quantity: Number (min: 1)
      size: String (optional)
      price: Number (snapshot at add time)
    }
  ]
  totalAmount: Number (calculated)
  timestamps: true
}
```

**Key Features:**
- One cart per user (unique constraint)
- Price snapshot prevents price manipulation
- Includes size for products with variants

---

### 2. Order Schema (`models/Order.ts`)

```typescript
{
  orderId: String (auto-generated, e.g., ORD-20231223-12345)
  user: ObjectId (ref: User)
  
  items: [
    {
      product: ObjectId
      productName: String (snapshot)
      productImage: String (snapshot)
      quantity: Number
      size: String (optional)
      price: Number (at purchase time)
      subtotal: Number (price × quantity)
    }
  ]
  
  // Pricing
  subtotal: Number
  shippingCost: Number
  tax: Number
  totalAmount: Number
  
  // Status
  status: enum ["pending", "payment_failed", "confirmed", "processing", "shipped", "delivered", "cancelled"]
  paymentStatus: enum ["pending", "processing", "completed", "failed", "refunded"]
  paymentMethod: enum ["razorpay", "mock", "cod"]
  
  // Razorpay details
  razorpayOrderId: String
  razorpayPaymentId: String
  razorpaySignature: String
  
  // Shipping
  shippingAddress: {
    name, phone, addressLine1, addressLine2, city, state, pincode
  }
  
  // Dates
  orderDate: Date
  paymentDate: Date
  deliveryDate: Date
  
  timestamps: true
}
```

**Key Features:**
- Auto-generated unique order ID
- Product snapshot (name, image) for historical record
- Comprehensive status tracking
- Separate order and payment status

---

### 3. Payment Schema (`models/Payment.ts`)

```typescript
{
  order: ObjectId (ref: Order)
  user: ObjectId (ref: User)
  
  gateway: enum ["razorpay", "mock"]
  
  razorpayOrderId: String
  razorpayPaymentId: String
  razorpaySignature: String
  
  amount: Number
  currency: String (default: "INR")
  status: enum ["created", "attempted", "success", "failed", "refunded"]
  
  method: String (card, upi, netbanking, etc.)
  errorCode: String
  errorDescription: String
  
  ipAddress: String
  userAgent: String
  
  attemptedAt: Date
  completedAt: Date
  
  timestamps: true
}
```

**Key Features:**
- Audit trail for all payment transactions
- Error tracking
- Useful for reconciliation

---

## API Routes

### 1. `/api/cart` (GET, POST, PUT, DELETE)

#### GET - Fetch Cart
```typescript
// Request
GET /api/cart

// Response
{
  success: true,
  data: {
    items: [...],
    totalAmount: 1234
  }
}
```

#### POST - Add to Cart
```typescript
// Request
POST /api/cart
{
  "productId": "abc123",
  "quantity": 2,
  "size": "M" // optional
}

// Response
{
  success: true,
  message: "Item added to cart",
  data: { /* cart object */ }
}
```

#### PUT - Update Quantity
```typescript
// Request
PUT /api/cart
{
  "productId": "abc123",
  "quantity": 3,
  "size": "M"
}
```

#### DELETE - Remove from Cart
```typescript
// Remove specific item
DELETE /api/cart?productId=abc123&size=M

// Clear entire cart
DELETE /api/cart
```

---

### 2. `/api/order/create` (POST, GET)

#### POST - Create Order
```typescript
// Request
POST /api/order/create
{
  "shippingAddress": {
    "name": "John Doe",
    "phone": "9876543210",
    "addressLine1": "123 Main St",
    "addressLine2": "Apt 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "notes": "Please deliver before 5 PM"
}

// Response
{
  success: true,
  message: "Order created successfully",
  data: {
    orderId: "64abc123...",
    orderNumber: "ORD-20231223-12345",
    totalAmount: 1234
  }
}
```

**Validations:**
- Checks if cart is not empty
- Verifies stock availability
- Validates complete shipping address

---

### 3. `/api/payment/create` (POST)

#### Create Razorpay Order
```typescript
// Request
POST /api/payment/create
{
  "orderId": "64abc123...",
  "mockMode": false // true for testing
}

// Response (Real Mode)
{
  success: true,
  data: {
    orderId: "order_N1xR5...", // Razorpay order ID
    amount: 123400, // in paise
    currency: "INR",
    orderNumber: "ORD-20231223-12345",
    key: "rzp_test_..." // for frontend
  }
}

// Response (Mock Mode)
{
  success: true,
  mockMode: true,
  data: {
    orderId: "mock_order_1703328000000",
    amount: 1234,
    currency: "INR",
    orderNumber: "ORD-20231223-12345"
  }
}
```

---

### 4. `/api/payment/verify` (POST, GET)

#### POST - Verify Payment
```typescript
// Request (Real Payment)
POST /api/payment/verify
{
  "razorpay_order_id": "order_N1xR5...",
  "razorpay_payment_id": "pay_N1xR5...",
  "razorpay_signature": "abc123..."
}

// Request (Mock Payment)
POST /api/payment/verify
{
  "razorpay_order_id": "mock_order_1703328000000",
  "razorpay_payment_id": "mock_payment_1703328000001",
  "razorpay_signature": "mock_signature",
  "mockMode": true
}

// Response
{
  success: true,
  message: "Payment verified successfully",
  data: {
    orderId: "ORD-20231223-12345",
    status: "confirmed",
    paymentId: "pay_N1xR5..."
  }
}
```

**What happens on successful verification:**
1. Order status → "confirmed"
2. Payment status → "completed"
3. Payment details saved
4. User's cart cleared
5. Product stock reduced

---

## Payment Flow (Step-by-Step)

### Complete Flow Diagram

```
User browses products
        ↓
Add items to cart (POST /api/cart)
        ↓
View cart (GET /api/cart)
        ↓
Proceed to checkout
        ↓
Enter shipping address
        ↓
Click "Proceed to Payment"
        ↓
1. Create Order (POST /api/order/create)
   - Validates cart not empty
   - Checks stock availability
   - Creates order with status="pending"
   - Returns orderId
        ↓
2. Create Payment (POST /api/payment/create)
   - Creates Razorpay order (or mock)
   - Returns payment details
        ↓
3A. MOCK MODE                    3B. REAL MODE
    - Simulates payment              - Opens Razorpay checkout
    - Auto-verifies                  - User completes payment
        ↓                                    ↓
4. Verify Payment (POST /api/payment/verify)
   - Verifies signature (real mode)
   - Updates order status → "confirmed"
   - Updates payment status → "completed"
   - Clears cart
   - Reduces stock
        ↓
5. Redirect to Success Page
   - Display order confirmation
   - Show order details
```

---

### Detailed Step Breakdown

#### Step 1: User Adds Items to Cart

```javascript
// Frontend call
const response = await fetch('/api/cart', {
  method: 'POST',
  body: JSON.stringify({
    productId: 'product123',
    quantity: 2,
    size: 'M'
  })
});
```

**Backend:**
- Validates product exists
- Checks stock availability
- Adds to user's cart or updates quantity
- Stores price snapshot

---

#### Step 2: Checkout Page

```javascript
// Fetch cart
const cart = await fetch('/api/cart');

// User fills shipping address
// Calculates totals (subtotal, shipping, tax)
```

---

#### Step 3: Create Order

```javascript
const orderResponse = await fetch('/api/order/create', {
  method: 'POST',
  body: JSON.stringify({
    shippingAddress: { /* address details */ }
  })
});

const { orderId, totalAmount } = orderResponse.data;
```

**Backend:**
- Validates cart not empty
- Re-checks stock availability
- Creates order snapshot from cart
- Generates unique order ID
- Sets status to "pending"

---

#### Step 4: Initialize Payment

```javascript
const paymentResponse = await fetch('/api/payment/create', {
  method: 'POST',
  body: JSON.stringify({
    orderId,
    mockMode: false // or true for testing
  })
});
```

**Backend (Real Mode):**
- Calls Razorpay API to create order
- Stores Razorpay order ID
- Creates payment record with status="created"
- Returns payment details to frontend

---

#### Step 5: Payment Gateway (Razorpay)

```javascript
// Load Razorpay script
const razorpay = new Razorpay({
  key: paymentData.key,
  amount: paymentData.amount,
  currency: 'INR',
  order_id: paymentData.orderId,
  handler: function(response) {
    // Payment successful, verify on server
    verifyPayment(response);
  }
});

razorpay.open();
```

**User sees:**
- Razorpay checkout modal
- Multiple payment options (UPI, cards, net banking, wallets)
- Payment confirmation

---

#### Step 6: Payment Verification

```javascript
async function verifyPayment(razorpayResponse) {
  const verifyResponse = await fetch('/api/payment/verify', {
    method: 'POST',
    body: JSON.stringify({
      razorpay_order_id: razorpayResponse.razorpay_order_id,
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_signature: razorpayResponse.razorpay_signature
    })
  });
  
  if (verifyResponse.success) {
    // Redirect to success page
    router.push(`/order/success?orderId=${orderId}`);
  }
}
```

**Backend (Critical Security Step):**
```javascript
// Generate signature using HMAC SHA256
const generatedSignature = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(`${razorpay_order_id}|${razorpay_payment_id}`)
  .digest('hex');

// Compare signatures
if (generatedSignature === razorpay_signature) {
  // Payment verified ✅
  // Update order and payment records
  // Clear cart
  // Reduce stock
}
```

---

#### Step 7: Order Confirmation

- User redirected to success page
- Order details displayed
- Confirmation email sent (optional, implement separately)

---

## Security Features

### 1. **Server-Side Signature Verification**
- Never trust frontend data
- Always verify Razorpay signature on server
- Uses HMAC SHA256 with secret key

### 2. **Environment Variables**
```env
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
```

### 3. **Authentication Checks**
- All API routes check user session
- Orders belong to authenticated user
- No unauthorized access to orders

### 4. **Stock Validation**
- Checks availability before order creation
- Prevents overselling
- Reduces stock only after payment verification

### 5. **Price Snapshot**
- Stores price in cart at add time
- Prevents price manipulation
- Order items have price snapshot

### 6. **Duplicate Payment Prevention**
- Checks if order already paid
- One payment per order

---

## Testing with Mock Mode

### Why Mock Mode?

During development, you don't want to make real payments. Mock mode allows you to:
- Test the complete flow
- Verify order creation
- Test database updates
- No real money involved

### How to Use Mock Mode

#### Option 1: Checkbox on Checkout Page
```tsx
<input
  type="checkbox"
  checked={mockMode}
  onChange={(e) => setMockMode(e.target.checked)}
/>
Enable Mock Payment Mode
```

#### Option 2: Environment Variable
```env
NEXT_PUBLIC_ENABLE_MOCK_PAYMENTS=true
```

### What Mock Mode Does

1. **Create Payment:** Returns mock order ID
2. **Verify Payment:** Skips signature verification
3. **Database Updates:** Same as real payment
4. **Stock Reduction:** Works normally
5. **Cart Clearing:** Works normally

### Mock Payment Flow

```javascript
// Mock payment data
{
  razorpay_order_id: "mock_order_1703328000000",
  razorpay_payment_id: "mock_payment_1703328000001",
  razorpay_signature: "mock_signature",
  mockMode: true
}
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install razorpay
npm install crypto
```

### 2. Environment Variables

Create `.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

# Razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_secret_key

# Public (for frontend)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
```

### 3. Get Razorpay Credentials

1. Sign up at [razorpay.com](https://razorpay.com)
2. Go to Settings → API Keys
3. Generate Test Keys (for development)
4. Copy Key ID and Secret

### 4. Test the Flow

#### Test Mode (No Real Payment)
1. Check "Enable Mock Payment Mode" on checkout
2. Complete checkout
3. Order will be confirmed without payment gateway

#### Real Test (Test Mode Keys)
1. Use Razorpay test keys
2. Uncheck mock mode
3. Use test card: `4111 1111 1111 1111`
4. CVV: Any 3 digits
5. Expiry: Any future date
6. Complete payment

---

## Common Issues & Solutions

### Issue 1: "Razorpay is not defined"

**Solution:** Razorpay script not loaded
```javascript
// Make sure script is loaded before opening
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

---

### Issue 2: Payment Verification Failed

**Causes:**
- Wrong secret key
- Incorrect signature generation
- Order ID mismatch

**Solution:**
```javascript
// Check environment variables
console.log(process.env.RAZORPAY_KEY_SECRET); // Should not be undefined

// Verify signature format
const text = `${order_id}|${payment_id}`;
const signature = crypto.createHmac('sha256', secret).update(text).digest('hex');
```

---

### Issue 3: Cart Not Clearing

**Solution:** Make sure verification route clears cart
```javascript
await Cart.findOneAndUpdate(
  { user: userId },
  { items: [], totalAmount: 0 }
);
```

---

### Issue 4: Stock Not Reducing

**Check:**
- `reduceStock()` function is called
- Product exists in database
- Correct size being updated

---

### Issue 5: Duplicate Orders

**Prevention:**
- Check order status before creating payment
- Add unique constraints
- Implement idempotency

---

## Production Checklist

Before going live:

- [ ] Switch to Razorpay Live Keys
- [ ] Disable mock mode in production
- [ ] Enable HTTPS (required by Razorpay)
- [ ] Add webhook for payment status updates
- [ ] Implement order confirmation emails
- [ ] Add proper error logging
- [ ] Test all edge cases
- [ ] Add rate limiting
- [ ] Implement retry mechanism
- [ ] Set up monitoring and alerts

---

## Additional Features to Consider

1. **Webhooks:** Handle payment status updates asynchronously
2. **Refunds:** Implement refund processing
3. **COD:** Add Cash on Delivery option
4. **EMI:** Enable EMI payments
5. **Wallet:** Add wallet/credits system
6. **Coupons:** Implement discount codes
7. **Invoices:** Generate PDF invoices
8. **Email Notifications:** Send order confirmations
9. **SMS Updates:** Order status via SMS
10. **Admin Panel:** Manage orders and payments

---

## Support

For issues:
- Check logs: `console.log` in API routes
- Razorpay Dashboard: View all transactions
- Database: Check order and payment collections

---

## Summary

This implementation provides:
✅ Complete cart system
✅ Secure order creation
✅ Razorpay integration
✅ Payment verification
✅ Mock mode for testing
✅ Stock management
✅ Order tracking
✅ User-friendly UI

Perfect for a college fest e-commerce project!
