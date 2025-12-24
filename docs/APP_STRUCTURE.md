# App Folder Structure & Components

## Overview
The `app/` folder contains the Next.js 16 App Router structure with both frontend pages and backend API routes using TypeScript.

---

## Directory Structure

```
app/
├── api/                          # Backend API endpoints
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts          # NextAuth.js authentication handler
│   ├── admin/
│   │   ├── export/
│   │   │   └── route.ts          # Export products/data endpoint
│   │   └── product/
│   │       └── route.ts          # Admin product management
│   ├── signup/
│   │   └── route.ts              # User registration endpoint
│   └── test-db/
│       └── route.ts              # Database connection test
├── admin/                        # Admin panel pages
│   ├── layout.tsx                # Admin layout wrapper
│   └── page.tsx                  # Admin dashboard
├── dashboard/                    # User dashboard pages
│   ├── LogoutButton.tsx          # Logout component
│   └── page.tsx                  # User dashboard
├── login/                        # Authentication pages
│   └── page.tsx                  # Login page
├── signup/                       # Registration pages
│   └── page.tsx                  # Signup page
├── layout.tsx                    # Root layout (HTML structure)
├── page.tsx                      # Home page
└── globals.css                   # Global styles (Tailwind)
```

---

## Page Components

### 1. **Home Page** (`page.tsx`)
- **Purpose**: Landing page for the application
- **Features**: 
  - Displays Next.js starter template content
  - Links to documentation and templates
  - Currently a default create-next-app page (intended to be customized)

### 2. **Sign Up Page** (`signup/page.tsx`)
**Type**: Client Component (`"use client"`)

**Features**:
- User registration form with validation
- Form fields:
  - Full Name
  - Email
  - Phone (optional)
  - Password
- **Functionality**:
  - Collects user input via form
  - Sends POST request to `/api/signup`
  - Validates password strength
  - Redirects to login on successful signup
  - Shows error alerts on failure

**Key Code**:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  const res = await fetch("/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  
  if (res.ok) router.push("/login");
  else alert("Signup failed");
};
```

### 3. **Login Page** (`login/page.tsx`)
**Type**: Client Component

**Features**:
- User login form
- Email and password input fields
- Integration with NextAuth.js
- Support for:
  - Email/Password login (Credentials Provider)
  - Google OAuth login
- Error handling and loading states

### 4. **Admin Dashboard** (`admin/page.tsx`)
**Type**: Protected page (requires admin role)

**Features**:
- Admin-only interface for managing products
- Likely includes:
  - Product listing/management
  - Inventory tracking
  - Order management
  - Export functionality

### 5. **User Dashboard** (`dashboard/page.tsx`)
**Type**: Protected page (requires user session)

**Features**:
- User-specific dashboard
- Displays user information
- Cart management
- Order history
- Account settings

**Associated Components**:
- `LogoutButton.tsx`: Button component for user logout

---

## API Routes (Backend Endpoints)

### 1. **Authentication** (`api/auth/[...nextauth]/route.ts`)
**Type**: Dynamic route handler for NextAuth.js

**Providers**:
```typescript
- GoogleProvider: OAuth login via Google
- CredentialsProvider: Email/password authentication
```

**Key Features**:
- JWT-based session strategy
- Sign-in callbacks for user creation/update
- Redirects to `/login` on sign-in
- Bcrypt password hashing and comparison
- User persistence in MongoDB

**Flow**:
1. User submits credentials or Google login
2. Credentials are validated against User model
3. Password is compared using bcrypt
4. JWT token is created for session
5. User info is stored/updated in MongoDB

### 2. **User Registration** (`api/signup/route.ts`)
**Type**: POST endpoint

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "phone": "+1234567890"
}
```

**Process**:
1. Receives form data from signup page
2. Checks if user already exists
3. Hashes password using bcrypt (salt rounds: 10)
4. Creates new User document in MongoDB
5. Returns success/error response

**Response**:
- Success (201): `{ message: "User created" }`
- Error (400): `{ message: "User already exists" }`

### 3. **Admin Product Management** (`api/admin/product/route.ts`)
**Type**: POST/GET endpoint (protected)

**Purpose**: Create, read, update, delete products (admin only)

**Expected Features**:
- Add new products
- Edit product details
- Update inventory
- Delete products

### 4. **Data Export** (`api/admin/export/route.ts`)
**Type**: GET endpoint (admin only)

**Purpose**: Export products/orders to Excel using XLSX library

**Features**:
- Generate Excel files
- Export product catalog
- Export order data
- Download functionality

### 5. **Database Test** (`api/test-db/route.ts`)
**Type**: GET endpoint

**Purpose**: Test MongoDB connection

**Usage**: Verify database connectivity during development

---

## Layouts

### Root Layout (`layout.tsx`)
**Type**: Server Component

**Features**:
- Sets up HTML document structure
- Applies global fonts (Geist Sans & Geist Mono)
- Loads global CSS styles
- Metadata configuration (title, description)
- CSS variables for custom fonts

**Structure**:
```typescript
<html lang="en">
  <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
    {children}
  </body>
</html>
```

### Admin Layout (`admin/layout.tsx`)
**Type**: Protected layout

**Purpose**: Wraps admin pages with consistent admin UI/navigation

---

## Styling

### Global Styles (`globals.css`)
- Tailwind CSS configuration
- Custom global styles
- CSS custom properties
- Theme variables (light/dark mode support)

---

## Authentication Flow

```
User Registration:
  Signup Page → /api/signup → Database → Success Message

User Login:
  Login Page → NextAuth (Google/Credentials) → /api/auth/[...nextauth] 
  → Database validation → JWT Token → Dashboard

Protected Pages:
  User/Admin Dashboard → Session check → Render or redirect to /login
```

---

## Key Technologies Used

- **Next.js 16**: Full-stack React framework
- **React 19**: UI library
- **TypeScript**: Type-safe development
- **NextAuth.js**: Authentication & authorization
- **Tailwind CSS**: Utility-first styling
- **MongoDB + Mongoose**: Database & ODM
- **Bcrypt**: Password hashing
- **XLSX**: Excel export functionality

---

## Current Status

✅ Authentication system (Google OAuth + Email/Password)  
✅ User registration and login pages  
✅ Database connection  
✅ Basic dashboard structure  
⏳ Product management pages (in progress)  
⏳ Order management features  
⏳ Shopping cart functionality  
⏳ Frontend UI customization needed  

---

## Development Notes

- The home page (`page.tsx`) is still using default create-next-app template
- Admin and dashboard pages structure exists but content may be minimal
- Product export feature is prepared (XLSX dependency installed)
- NextAuth.js is configured with Google OAuth (credentials needed in .env.local)
