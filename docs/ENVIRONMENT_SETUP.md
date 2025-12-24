# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/alcher_store?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key_here_min_32_chars

# Razorpay API Keys (Test Mode)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key_here

# Public Variables (Accessible in Frontend)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
```

---

## How to Get Each Variable

### 1. MONGODB_URI

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password

---

### 2. NEXTAUTH_SECRET

Generate a random secret:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use any random string generator
# Must be at least 32 characters
```

---

### 3. Razorpay Keys

#### Sign Up:
1. Go to [https://razorpay.com/](https://razorpay.com/)
2. Sign up for an account
3. Complete verification

#### Get Test Keys:
1. Login to Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Click **Generate Test Key**
4. Copy:
   - **Key ID** → `RAZORPAY_KEY_ID`
   - **Key Secret** → `RAZORPAY_KEY_SECRET`

⚠️ **Important:** Keep the secret key secure. Never commit it to Git!

---

## Production Environment Variables

For production (live website), create `.env.production`:

```env
# Production MongoDB
MONGODB_URI=your_production_mongodb_uri

# Production Domain
NEXTAUTH_URL=https://yourdomain.com

# Razorpay LIVE Keys (after KYC completion)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_live_secret_key

# Public
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
```

---

## .gitignore

Make sure `.env.local` is in your `.gitignore`:

```gitignore
# Environment Variables
.env.local
.env.production
.env

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Dependencies
node_modules/
```

---

## Verification

To verify your environment variables are loaded:

```javascript
// In any API route
console.log('MongoDB:', process.env.MONGODB_URI ? '✓' : '✗');
console.log('Razorpay Key:', process.env.RAZORPAY_KEY_ID ? '✓' : '✗');
console.log('Razorpay Secret:', process.env.RAZORPAY_KEY_SECRET ? '✓' : '✗');
```

---

## Security Best Practices

1. **Never commit** `.env.local` to Git
2. **Use different keys** for development and production
3. **Rotate keys** periodically
4. **Restrict API access** in Razorpay dashboard
5. **Enable IP whitelisting** for production

---

## Testing Without Real Payment

Set `mockMode: true` in your checkout page to test without real payments. See [PAYMENT_FLOW.md](./PAYMENT_FLOW.md) for details.
