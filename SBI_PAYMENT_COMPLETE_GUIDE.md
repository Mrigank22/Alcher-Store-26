# SBI Payment Integration - Complete Guide
## Alcheringa Store Payment System

**Last Updated:** January 13, 2026  
**Version:** 1.0.0 - Production Ready  
**Status:** ✅ Ready for Deployment

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Configuration](#configuration)
4. [Deployment Guide](#deployment-guide)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)
7. [API Reference](#api-reference)

---

## 🚀 Quick Start

### What You Need

✅ SBI Merchant Account (ID: `1003121`)  
✅ Encryption Key: `V5csjV4nMM8pz6uWaSp1Iw==`  
✅ Domain: `store.alcheringa.co.in` (for Alcher Store)  
✅ Domain: `alcheringa.iitg.ac.in/store` (Cards Portal - already deployed)  

### Pre-Deployment Checklist

- [ ] Get `https://store.alcheringa.co.in/api/payment/sbi-callback` whitelisted with SBI
- [ ] Set environment variables in production
- [ ] Deploy Alcher Store to `store.alcheringa.co.in`
- [ ] Verify Cards Portal is accessible at `alcheringa.iitg.ac.in/store`
- [ ] Test end-to-end payment flow

---

## 🏗️ Architecture Overview

### Payment Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER JOURNEY                             │
└─────────────────────────────────────────────────────────────┘

1️⃣ User adds items to cart
   ↓
2️⃣ Clicks "Proceed to Payment" on checkout
   ↓
3️⃣ Alcher Store creates order + generates encrypted data
   ↓
4️⃣ Redirects to alcheringa.iitg.ac.in/store (Cards Portal)
   ↓
5️⃣ Cards Portal auto-submits form to SBI Gateway
   ↓
6️⃣ User completes payment on SBI page (UPI/Card/NetBanking)
   ↓
7️⃣ SBI sends callback to store.alcheringa.co.in/api/payment/sbi-callback
   ↓
8️⃣ Alcher Store decrypts, verifies, updates order
   ↓
9️⃣ Redirects user to success/failure page
```

### Component Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    ALCHER STORE BACKEND                      │
│            (store.alcheringa.co.in)                         │
├──────────────────────────────────────────────────────────────┤
│  • Order Management                                          │
│  • Payment Record Management                                 │
│  • SBI Encryption/Decryption (AES-192-CBC)                  │
│  • Callback Processing                                       │
│  • Double Verification with SBI                              │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 │ Redirect with encrypted data
                 ▼
┌──────────────────────────────────────────────────────────────┐
│                   CARDS PORTAL FRONTEND                      │
│          (alcheringa.iitg.ac.in/store)                      │
├──────────────────────────────────────────────────────────────┤
│  • Whitelisted Domain (SBI approved)                        │
│  • Receives encrypted transaction data                       │
│  • Auto-submits form to SBI Gateway                         │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 │ Form POST
                 ▼
┌──────────────────────────────────────────────────────────────┐
│                     SBI PAYMENT GATEWAY                      │
│           (epay.sbi.bank.in)                                │
├──────────────────────────────────────────────────────────────┤
│  • Payment Processing                                        │
│  • UPI / Cards / Net Banking                                │
│  • Transaction Security                                      │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 │ Callback with encrypted response
                 ▼
         ┌───────────────────┐
         │   Alcher Store    │
         │  /api/payment/    │
         │  sbi-callback     │
         └───────────────────┘
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env.local` in Alcher Store root:

```bash
# ========================================
# DATABASE
# ========================================
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/alcher_store

# ========================================
# AUTHENTICATION
# ========================================
NEXTAUTH_URL=https://store.alcheringa.co.in
NEXTAUTH_SECRET=your-secret-key-here

# ========================================
# SBI PAYMENT GATEWAY
# ========================================
SBI_MERCHANT_ID=1003121
SBI_ENCRYPTION_KEY=V5csjV4nMM8pz6uWaSp1Iw==
SBI_CALLBACK_URL=https://store.alcheringa.co.in/api/payment/sbi-callback
CARDS_PORTAL_URL=https://alcheringa.iitg.ac.in/store

# ========================================
# FRONTEND
# ========================================
NEXT_PUBLIC_APP_URL=https://store.alcheringa.co.in
```

### SBI Configuration Details

| Parameter | Value | Notes |
|-----------|-------|-------|
| Merchant ID | `1003121` | SBI provided |
| Encryption Key | `V5csjV4nMM8pz6uWaSp1Iw==` | Base64 encoded, 24 bytes |
| Algorithm | AES-192-CBC | Key treated as UTF-8 string |
| Gateway URL | `https://epay.sbi.bank.in/secure/AggregatorHostedListener` | Production |
| Aggregator ID | `SBIEPAY` | Fixed value |
| Checksum Type | SHA256 | For encryption |

---

## 🚀 Deployment Guide

### Step 1: Build Application

```bash
cd Alcher-Store-26
npm install
npm run build
```

### Step 2: Set Environment Variables

On your hosting platform (Vercel, AWS, etc.):

1. Add all variables from `.env.local`
2. Verify `MONGODB_URI` is correct
3. Set `NEXTAUTH_URL` to production domain
4. Double-check `SBI_CALLBACK_URL` matches deployed domain

### Step 3: Deploy

```bash
# For Vercel
vercel --prod

# For other platforms, follow their deployment process
```

### Step 4: Verify Deployment

```bash
# 1. Check if site is accessible
curl https://store.alcheringa.co.in

# 2. Check callback endpoint
curl https://store.alcheringa.co.in/api/payment/sbi-callback

# Expected response:
# {"success":true,"message":"SBI Payment Callback Endpoint",...}

# 3. Check cards portal
curl https://alcheringa.iitg.ac.in/store

# Should return HTML page
```

### Step 5: Whitelist Callback URL with SBI

**CRITICAL:** Contact SBI support to whitelist:
```
https://store.alcheringa.co.in/api/payment/sbi-callback
```

Provide:
- Merchant ID: `1003121`
- Callback URL: Full URL above
- Domain: `store.alcheringa.co.in`

### Step 6: Test Payment

1. Go to checkout page
2. Add shipping address
3. Click "Proceed to Payment"
4. Verify redirect to `alcheringa.iitg.ac.in/store`
5. Check auto-redirect to SBI payment page
6. Complete test transaction (₹1)
7. Verify redirect back to success page
8. Check order status updated in database

---

## 🧪 Testing

### Local Testing (Limited)

**What works locally:**
- ✅ Order creation
- ✅ Payment data generation
- ✅ Redirect to cards portal
- ❌ Actual SBI payment (callback won't work)

### Using ngrok for Full Local Testing

```bash
# Terminal 1: Start your app
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000

# Copy the ngrok URL (e.g., https://abc123.ngrok.io)
# Temporarily update SBI_CALLBACK_URL in .env.local:
SBI_CALLBACK_URL=https://abc123.ngrok.io/api/payment/sbi-callback

# Restart your app
# Now you can test complete flow locally!
```

### Production Testing

**Test Checklist:**

1. **Before Payment:**
   - [ ] Cart items display correctly
   - [ ] Shipping address validates
   - [ ] Order creates successfully
   - [ ] Encrypted data generates

2. **During Payment:**
   - [ ] Redirects to cards portal
   - [ ] Cards portal shows payment details
   - [ ] Auto-redirects to SBI (within 2 seconds)
   - [ ] SBI payment page loads

3. **After Payment:**
   - [ ] Callback received (check logs)
   - [ ] Order status changes to `confirmed`
   - [ ] Payment record created
   - [ ] User redirects to success page
   - [ ] Order details show on success page

### Test Transaction Details

```json
{
  "amount": "₹1",
  "purpose": "Test transaction",
  "paymentMode": "UPI",
  "transactionId": "ALST_ORD-XXXXXXXX-XXXXX_timestamp"
}
```

---

## 🔧 Troubleshooting

### Issue 1: "Unavoidable circumstances" from SBI

**Symptoms:** SBI shows generic error immediately after redirect

**Causes:**
1. Callback URL not whitelisted
2. Wrong merchant ID
3. Incorrect encryption key
4. Encryption format mismatch

**Solutions:**
```bash
# Check logs for encryption output
[SBI Encryption] Plain text before encryption: ...

# Verify format matches:
1003121|DOM|IN|INR|amount|NA|callback|callback|SBIEPAY|txnId|txnId|UPI|ONLINE|ONLINE

# Check encryption key length (should be 24 bytes as UTF-8):
echo -n "V5csjV4nMM8pz6uWaSp1Iw==" | wc -c
# Output: 24

# Verify merchant ID in logs matches: 1003121
```

### Issue 2: Callback Not Received

**Symptoms:** Payment completes but order status doesn't update

**Debug Steps:**

```bash
# 1. Check if callback endpoint is accessible from internet
curl -X POST https://store.alcheringa.co.in/api/payment/sbi-callback \
  -d "encData=test" \
  -d "merchIdVal=1003121"

# 2. Check server logs for callback requests
# Look for: [SBI Callback] Received payment callback

# 3. Verify callback URL in database order record
# Check field: order.sbiTransactionId

# 4. Test callback URL from external server
# SBI needs to reach your backend from their servers
```

**Common Fixes:**
- Ensure backend is deployed (not on localhost)
- Check firewall allows POST requests
- Verify SSL certificate is valid
- Confirm callback URL matches exactly

### Issue 3: Order Status Not Updating

**Symptoms:** Callback received but order stays in `pending`

**Debug:**

```javascript
// Check in MongoDB
db.orders.findOne({ orderId: "ORD-20260113-XXXXX" })

// Verify fields:
{
  paymentStatus: "completed",  // Should change to this
  orderStatus: "confirmed",    // Should change to this
  sbiTransactionId: "ALST_...", // Should match callback
  paidAt: ISODate("...")       // Should be set
}

// Check payment record
db.payments.findOne({ transactionId: "ALST_..." })

{
  status: "success",           // Should be this
  completedAt: ISODate("...")  // Should be set
}
```

**Fix:**
- Check for errors in callback logs
- Verify transaction ID matches
- Ensure MongoDB connection is stable
- Check for validation errors

### Issue 4: Encryption Key Length Error

**Error Message:**
```
ERR_CRYPTO_INVALID_KEYLEN: Invalid key length
```

**Solution:**

Current code uses **AES-192-CBC** (24-byte key as UTF-8 string):

```typescript
// ✅ CORRECT (current implementation)
const keyBuffer = Buffer.from(key, 'utf-8');
const cipher = crypto.createCipheriv('aes-192-cbc', keyBuffer, iv);

// ❌ WRONG
const keyBuffer = Buffer.from(key, 'base64'); // Would be 16 bytes
const cipher = crypto.createCipheriv('aes-128-cbc', keyBuffer, iv);
```

### Common Log Messages

**✅ Success:**
```
[SBI Payment] Created transaction for Order ORD-20260113-41123
[SBI Encryption] Encrypted data length: 320
[SBI Callback] Received payment callback from SBI gateway
[SBI Callback] Payment SUCCESS - Order updated: ORD-20260113-41123
```

**❌ Errors:**
```
[SBI Callback] Order not found for transaction: ALST_...
[SBI Callback] Validation failed: ...
[SBI Callback] Error processing payment callback: ...
```

---

## 📚 API Reference

### POST /api/order/create

Creates order from cart before payment.

**Request:**
```json
{
  "shippingAddress": {
    "name": "John Doe",
    "phone": "9876543210",
    "addressLine1": "123 Street",
    "city": "Guwahati",
    "state": "Assam",
    "pincode": "781001",
    "email": "user@example.com"
  },
  "isDirect": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "69662e862d0c4b88841a7038",
    "orderNumber": "ORD-20260113-41123"
  }
}
```

---

### POST /api/payment/sbi-create

Generates encrypted payment data for SBI.

**Request:**
```json
{
  "orderId": "69662e862d0c4b88841a7038",
  "paymentMode": "UPI"
}
```

**Payment Modes:**
- `UPI` - UPI payment
- `NET_BANKING` - Net Banking
- `DEBIT_CARD` - Debit Card
- `CREDIT_CARD` - Credit Card

**Response:**
```json
{
  "success": true,
  "data": {
    "EncryptTrans": "MX57AYaJTs7K...",
    "merchIdVal": "1003121",
    "sbiTransactionId": "ALST_ORD-20260113-41123_1768304263176",
    "orderNumber": "ORD-20260113-41123",
    "amount": 1,
    "cardsPortalUrl": "https://alcheringa.iitg.ac.in/store"
  }
}
```

---

### POST /api/payment/sbi-callback

**⚠️ Called by SBI Gateway - No authentication required**

Receives encrypted payment response.

**Request (Form Data):**
- `encData`: Encrypted payment response from SBI
- `merchIdVal`: Merchant ID (must match `1003121`)
- `Bank_Code`: Bank code (optional)

**Response:**
```
HTTP 303 Redirect
Location: https://store.alcheringa.co.in/order/success?orderId=xxx&txnId=xxx
```

**Decrypted Response Format:**
```
txnId|atrnNo|status|amount|...fields...|bankRef|txnDate|...|challanNo|...|totalFee^gst
```

**Status Values:**
- `SUCCESS` - Payment successful
- `FAIL` / `FAILURE` - Payment failed
- Other - Pending/unknown

---

## 📊 Database Schema

### Order Document
```typescript
{
  _id: ObjectId,
  orderId: "ORD-20260113-41123",        // User-facing ID
  user: ObjectId,                        // Reference to User
  items: [{
    product: ObjectId,                   // Reference to Product
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  shippingCost: 0,                       // Free shipping
  tax: Number,
  shippingAddress: {
    name: String,
    phone: String,
    addressLine1: String,
    city: String,
    state: String,
    pincode: String,
    email: String
  },
  paymentMethod: "sbi",                  // Payment method used
  paymentGateway: "SBI",                 // Gateway name
  paymentStatus: "completed",            // pending | completed | failed
  orderStatus: "confirmed",              // pending | confirmed | payment_failed
  sbiTransactionId: "ALST_...",         // Unique SBI transaction ID
  paidAt: Date,                          // Payment completion time
  paymentDetails: {                      // SBI response details
    bankRefNo: String,
    transactionDate: String,
    challanNo: String,
    totalFee: String,
    gst: String,
    atrn: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Document
```typescript
{
  _id: ObjectId,
  order: ObjectId,                       // Reference to Order
  user: ObjectId,                        // Reference to User
  gateway: "sbi",                        // Payment gateway
  transactionId: "ALST_...",            // SBI transaction ID
  amount: Number,
  currency: "INR",
  status: "success",                     // created | success | failed
  metadata: {                            // Full SBI response
    transactionId: String,
    atrn: String,
    status: String,
    amount: String,
    bankRefNo: String,
    transactionDate: String,
    challanNo: String,
    totalFee: String,
    gst: String
  },
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Security

### Encryption

**Algorithm:** AES-192-CBC
- **Key:** 24-byte UTF-8 string (not base64 decoded)
- **IV:** Random 16 bytes per transaction
- **Padding:** Manual PKCS7 padding
- **Output:** Base64 encoded (IV prepended)

### Validation Flow

1. **Merchant ID Check:** Verify matches `1003121`
2. **Decryption:** Decrypt using encryption key
3. **Transaction Match:** Find order by `sbiTransactionId`
4. **Amount Verification:** Compare with order amount
5. **Double Verification:** Query SBI status API
6. **Status Update:** Update order only if all checks pass

### Best Practices

✅ Never commit `.env.local` to git  
✅ Use environment variables for secrets  
✅ Rotate encryption key if compromised  
✅ Monitor logs for suspicious activity  
✅ Implement rate limiting on callback endpoint  
✅ Keep transaction logs for audit trail  

---

## 📞 Support

### Issues & Questions

**For SBI Gateway Issues:**
- Contact SBI merchant support
- Provide: Merchant ID, Transaction ID, Timestamp

**For Integration Issues:**
- Check this documentation first
- Review logs for error messages
- Search for similar issues in project docs

### Important URLs

- **Production Store:** https://store.alcheringa.co.in
- **Cards Portal:** https://alcheringa.iitg.ac.in/store
- **SBI Gateway:** https://epay.sbi.bank.in/secure/AggregatorHostedListener

---

## ✅ Launch Checklist

Before going live:

- [ ] All environment variables set in production
- [ ] Callback URL whitelisted with SBI
- [ ] MongoDB connection verified
- [ ] SSL certificate valid
- [ ] Test transaction completed successfully
- [ ] Order status updates correctly
- [ ] Payment records created properly
- [ ] Success/failure redirects working
- [ ] Logs monitoring set up
- [ ] Backup plan in place

---

**🎉 Integration Complete!**

The SBI payment gateway is fully integrated and ready for production. For any issues, refer to the troubleshooting section or contact the development team.

**Document Version:** 1.0.0  
**Last Updated:** January 13, 2026  
**Status:** Production Ready ✅
