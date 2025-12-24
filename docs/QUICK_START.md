# Quick Start Guide

## 🚀 Getting Started

This guide helps you set up the complete e-commerce checkout and payment system.

---

## 📦 Installation

### 1. Install Dependencies

```bash
npm install razorpay
```

All other dependencies should already be in your `package.json`.

---

## ⚙️ Configuration

### 1. Create Environment File

Create `.env.local` in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key_32_chars_minimum
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
```

See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed instructions.

---

## 🧪 Testing

### Test with Mock Payments (No Real Money)

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to checkout page
3. Check "Enable Mock Payment Mode"
4. Complete checkout - order will be confirmed without payment gateway

### Test with Razorpay Test Mode

1. Use Razorpay test keys in `.env.local`
2. Uncheck "Mock Payment Mode"
3. Use test card details:
   - **Card Number:** `4111 1111 1111 1111`
   - **CVV:** Any 3 digits (e.g., `123`)
   - **Expiry:** Any future date (e.g., `12/25`)
   - **Name:** Any name

---

## 📁 File Structure

```
Alcher-Store-26/
├── models/
│   ├── Cart.ts           # Cart schema
│   ├── Order.ts          # Order schema
│   ├── Payment.ts        # Payment schema
│   ├── Product.ts        # Existing
│   └── User.ts           # Existing
│
├── app/
│   ├── api/
│   │   ├── cart/
│   │   │   └── route.ts         # Cart CRUD operations
│   │   ├── order/
│   │   │   └── create/
│   │   │       └── route.ts     # Order creation
│   │   └── payment/
│   │       ├── create/
│   │       │   └── route.ts     # Payment initialization
│   │       └── verify/
│   │           └── route.ts     # Payment verification
│   │
│   ├── checkout/
│   │   └── page.tsx             # Checkout page with payment
│   └── order/
│       └── success/
│           └── page.tsx         # Order success page
│
└── docs/
    ├── PAYMENT_FLOW.md          # Complete documentation
    ├── ENVIRONMENT_SETUP.md     # Environment variables guide
    └── QUICK_START.md           # This file
```

---

## 🔄 Complete User Flow

1. **Browse Products** → User views products on homepage
2. **Add to Cart** → `POST /api/cart`
3. **View Cart** → `GET /api/cart`
4. **Checkout** → Navigate to `/checkout`
5. **Enter Address** → Fill shipping form
6. **Create Order** → `POST /api/order/create`
7. **Initialize Payment** → `POST /api/payment/create`
8. **Complete Payment** → Razorpay modal (or mock)
9. **Verify Payment** → `POST /api/payment/verify`
10. **Success Page** → Redirect to `/order/success`

---

## 🛠️ API Endpoints Quick Reference

### Cart Operations

```javascript
// Get cart
GET /api/cart

// Add to cart
POST /api/cart
Body: { productId, quantity, size? }

// Update quantity
PUT /api/cart
Body: { productId, quantity, size? }

// Remove item
DELETE /api/cart?productId=xxx&size=xxx

// Clear cart
DELETE /api/cart
```

### Order Operations

```javascript
// Create order
POST /api/order/create
Body: { shippingAddress: {...}, notes? }

// Get order details
GET /api/order/create?orderId=xxx
```

### Payment Operations

```javascript
// Create payment order
POST /api/payment/create
Body: { orderId, mockMode? }

// Verify payment
POST /api/payment/verify
Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, mockMode? }

// Get payment status
GET /api/payment/verify?orderId=xxx
```

---

## 🧑‍💻 Frontend Integration Example

### Add to Cart

```typescript
const addToCart = async (productId: string, quantity: number, size?: string) => {
  const response = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity, size })
  });
  
  const result = await response.json();
  if (result.success) {
    alert('Added to cart!');
  }
};
```

### Checkout Process

See [app/checkout/page.tsx](../app/checkout/page.tsx) for complete implementation.

---

## 🔒 Security Notes

1. **Never expose secret keys** to frontend
2. **Always verify payments** on server side
3. **Use HTTPS** in production
4. **Validate all inputs** before processing
5. **Check user authentication** in all API routes

---

## 🐛 Debugging

### Check API Routes

```bash
# In terminal while server is running
curl http://localhost:3000/api/cart
```

### Check Environment Variables

Add to any API route:
```javascript
console.log('Env check:', {
  mongodb: !!process.env.MONGODB_URI,
  razorpay: !!process.env.RAZORPAY_KEY_ID,
  secret: !!process.env.RAZORPAY_KEY_SECRET
});
```

### Common Issues

1. **"Razorpay is not defined"**
   - Razorpay script not loaded
   - Check console for script errors

2. **"Payment verification failed"**
   - Wrong secret key
   - Check environment variables
   - Ensure correct signature generation

3. **"Cart is empty"**
   - User not authenticated
   - Check session in API routes

---

## 📱 Mobile Testing

Razorpay checkout is mobile-responsive. Test on:
- Chrome DevTools (mobile view)
- Real device using ngrok or similar
- Use test cards on mobile

---

## 🚢 Deployment

### Before Deploying:

1. ✅ Switch to Razorpay **Live Keys**
2. ✅ Update `NEXTAUTH_URL` to your domain
3. ✅ Disable mock mode in production
4. ✅ Enable HTTPS (required for Razorpay)
5. ✅ Test thoroughly in staging environment

### Deploy to Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

---

## 📚 Additional Resources

- [Payment Flow Documentation](./PAYMENT_FLOW.md) - Detailed flow explanation
- [Environment Setup](./ENVIRONMENT_SETUP.md) - How to get API keys
- [Razorpay Docs](https://razorpay.com/docs/) - Official documentation
- [Next.js Docs](https://nextjs.org/docs) - Next.js documentation

---

## 💡 Tips for College Project

1. **Use Mock Mode** during presentation to avoid payment gateway issues
2. **Keep screenshots** of successful transactions
3. **Document everything** in your report
4. **Add error handling** to make it robust
5. **Test edge cases** (empty cart, insufficient stock, etc.)

---

## 🎓 What You've Learned

✅ Next.js App Router API routes
✅ MongoDB with Mongoose
✅ Payment gateway integration
✅ Security best practices
✅ State management in React
✅ Server-side validation
✅ Signature verification
✅ Order management system

---

## 🆘 Need Help?

1. Check [PAYMENT_FLOW.md](./PAYMENT_FLOW.md) for detailed explanations
2. Review API route code comments
3. Check browser console for errors
4. Review server logs (`npm run dev` output)
5. Test with mock mode first

---

## ✅ Checklist

Before submission:

- [ ] All environment variables set
- [ ] Dependencies installed
- [ ] Database connected
- [ ] Cart system working
- [ ] Order creation working
- [ ] Payment flow tested (mock mode)
- [ ] Payment flow tested (test mode)
- [ ] Success page displaying correctly
- [ ] Stock reducing after payment
- [ ] Cart clearing after payment
- [ ] Documentation complete

---

Happy coding! 🎉
