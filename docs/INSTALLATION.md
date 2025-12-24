# Installation and Setup Instructions

## 📦 Step 1: Install Dependencies

Run this command in your terminal:

```bash
npm install razorpay
```

This will install the Razorpay SDK for server-side payment processing.

---

## 📝 Step 2: Create Environment File

Create a file named `.env.local` in the root directory (same level as package.json):

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key_at_least_32_characters

# Razorpay API Keys (Test Mode for Development)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key_here

# Public Variables (Accessible in Frontend)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
```

### How to Get Razorpay Keys:

1. **Sign up** at [https://razorpay.com/](https://razorpay.com/)
2. Go to **Settings** → **API Keys**
3. Click **Generate Test Key**
4. Copy the **Key ID** and **Key Secret**

**Note:** Use test keys during development. Switch to live keys only for production.

---

## 🗄️ Step 3: Database Setup

Your MongoDB should have these collections (they will be created automatically):
- `users`
- `products`
- `carts`
- `orders`
- `payments`

No manual setup needed - Mongoose will create them when you first use them.

---

## 🚀 Step 4: Run the Development Server

```bash
npm run dev
```

Server will start at: `http://localhost:3000`

---

## 🧪 Step 5: Test the System

### Option A: Mock Payment (No Real Money)

1. Navigate to `/checkout`
2. Add items to cart (you need to create this functionality on your product pages)
3. Check "Enable Mock Payment Mode"
4. Fill in shipping address
5. Click "Proceed to Payment"
6. Order will be confirmed automatically

### Option B: Test with Razorpay Test Mode

1. Navigate to `/checkout`
2. Add items to cart
3. Uncheck "Mock Payment Mode"
4. Fill in shipping address
5. Click "Proceed to Payment"
6. Use test card:
   - Card: `4111 1111 1111 1111`
   - CVV: `123`
   - Expiry: `12/25`
   - Name: Any name
7. Complete payment

---

## 📋 Testing Checklist

Test these features:

- [ ] Add item to cart: `POST /api/cart`
- [ ] View cart: `GET /api/cart`
- [ ] Update cart quantity: `PUT /api/cart`
- [ ] Remove from cart: `DELETE /api/cart`
- [ ] Create order: `POST /api/order/create`
- [ ] Initialize payment: `POST /api/payment/create`
- [ ] Complete payment (mock mode)
- [ ] Complete payment (test mode)
- [ ] Verify cart clears after payment
- [ ] Verify stock reduces after payment
- [ ] View order success page

---

## 🔗 API Endpoints Created

All these endpoints are now available:

### Cart Management
- `GET /api/cart` - Fetch user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart` - Update item quantity
- `DELETE /api/cart` - Remove item or clear cart

### Order Management
- `POST /api/order/create` - Create new order
- `GET /api/order/create?orderId=xxx` - Get order details

### Payment Processing
- `POST /api/payment/create` - Initialize payment
- `POST /api/payment/verify` - Verify payment
- `GET /api/payment/verify?orderId=xxx` - Get payment status

---

## 🎨 Frontend Pages Created

- `/checkout` - Complete checkout page with payment
- `/order/success` - Order confirmation page

---

## 🔧 Integration with Your Product Pages

To add "Add to Cart" functionality to your product pages:

```typescript
// In your product page component
const addToCart = async (productId: string, quantity: number = 1, size?: string) => {
  try {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity, size })
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('✅ Item added to cart!');
      // Optionally redirect to /checkout
      // router.push('/checkout');
    } else {
      alert(result.message);
    }
  } catch (error) {
    alert('Failed to add to cart');
  }
};
```

---

## 📱 Example: Add to Cart Button

```tsx
<button 
  onClick={() => addToCart(product._id, 1, selectedSize)}
  className="bg-blue-500 text-white px-6 py-2 rounded"
>
  Add to Cart
</button>
```

---

## 🛠️ Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution:** Check your `MONGODB_URI` in `.env.local`

### Issue: "Razorpay is not defined"
**Solution:** 
1. Check if Razorpay script loaded: Open browser console
2. Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set

### Issue: "Payment verification failed"
**Solution:**
1. Verify `RAZORPAY_KEY_SECRET` is correct
2. Check if you're using test keys
3. Ensure signature generation is correct

### Issue: "Cart is empty"
**Solution:** Make sure user is logged in and has items in cart

---

## 📚 Documentation Files

Detailed documentation is available in the `docs/` folder:

1. **QUICK_START.md** - Quick reference guide
2. **PAYMENT_FLOW.md** - Complete payment flow explanation
3. **ENVIRONMENT_SETUP.md** - Environment variables guide

---

## 🚢 Deployment (When Ready for Production)

### 1. Get Razorpay Live Keys

1. Complete KYC verification on Razorpay
2. Generate live keys
3. Replace test keys with live keys

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel
```

### 3. Add Environment Variables in Vercel

Go to your project settings in Vercel and add all environment variables.

### 4. Enable HTTPS

Vercel provides HTTPS by default. Razorpay requires HTTPS in production.

---

## ✅ You're All Set!

Your complete e-commerce checkout and payment system is now ready. Features include:

✅ Shopping cart management
✅ Order creation
✅ Razorpay payment integration
✅ Payment verification
✅ Mock payment mode for testing
✅ Order confirmation
✅ Stock management
✅ Secure server-side validation

---

## 💡 Next Steps

1. Test the complete flow with mock payments
2. Test with Razorpay test mode
3. Integrate "Add to Cart" buttons on product pages
4. Customize the checkout page design
5. Add email notifications (optional)
6. Create an admin panel to view orders (optional)

---

## 🆘 Need Help?

Refer to the documentation:
- [PAYMENT_FLOW.md](./PAYMENT_FLOW.md) - Detailed flow explanation
- [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - Environment setup guide
- [QUICK_START.md](./QUICK_START.md) - Quick reference

Good luck with your college fest project! 🎉
