# Alcher Store - Project Overview

## Project Summary
**Alcher Store** is an e-commerce web application built with **Next.js 16**, **TypeScript**, and **MongoDB**. It's a modern, full-stack platform for managing products and user accounts with authentication, admin dashboards, and cart/order management features.

## Tech Stack
- **Frontend Framework**: Next.js 16 with React 19
- **Language**: TypeScript
- **Authentication**: NextAuth.js 4.24.13 (Google OAuth + Credentials)
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Security**: Bcrypt for password hashing
- **Data Import/Export**: XLSX library for Excel support

## Key Features
✅ User authentication (Google OAuth + Email/Password)  
✅ User registration with encrypted passwords  
✅ Admin dashboard for product management  
✅ Product catalog with inventory management  
✅ Shopping cart system  
✅ Order tracking with status management  
✅ User roles (user/admin)  
✅ Product reviews and ratings  
✅ Size-based inventory tracking  

## Project Structure
```
Alcher-Store-26/
├── app/                          # Next.js App Router (frontend & API)
│   ├── api/                      # API routes
│   ├── admin/                    # Admin dashboard pages
│   ├── dashboard/                # User dashboard
│   ├── login/                    # Login page
│   ├── signup/                   # Registration page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── models/                       # MongoDB schemas
│   ├── User.ts                   # User model
│   └── Product.ts                # Product model
├── lib/                          # Utilities
│   └── mongodb.ts                # MongoDB connection
├── public/                       # Static assets
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── next.config.ts                # Next.js config
├── tailwind.config.js            # Tailwind CSS config
└── eslint.config.mjs             # ESLint config
```

## Environment Variables Required
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_SECRET` - NextAuth encryption secret
- `NEXTAUTH_URL` - Application URL (http://localhost:3000 for dev)

## Getting Started
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm build

# Start production server
npm start
```

Access the app at `http://localhost:3000`

## Main Features in Detail
1. **Authentication System**: Supports Google login and traditional email/password registration
2. **Product Management**: Admin can manage products with sizes, stock, prices, and images
3. **User Cart**: Users can add products to cart (stored as product IDs)
4. **Order System**: Track orders with statuses (pending, shipped, delivered, cancelled)
5. **Admin Dashboard**: Manage products and view export data
6. **Reviews**: Users can leave reviews and ratings on products
