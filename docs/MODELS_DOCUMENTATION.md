# Database Models Documentation

## Overview
The application uses MongoDB with Mongoose ODM for data persistence. There are two main data models: **User** and **Product**.

---

## User Model

**File**: `models/User.ts`

### Schema Structure
```typescript
{
  name: String (required),
  email: String (required, unique),
  phone: String (default: ""),
  address: String[] (default: []),
  cart: ObjectId[] (default: []),
  orders: OrderSchema[] (default: []),
  password: String (optional, only for manual signup),
  image: String (optional, from Google OAuth),
  role: String (enum: ["user", "admin"], default: "user"),
  timestamps: true (createdAt, updatedAt)
}
```

### Field Details

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | String | Yes | User's full name |
| `email` | String | Yes | Unique email address for login |
| `phone` | String | No | Contact phone number |
| `address` | String[] | No | Array of saved addresses |
| `cart` | ObjectId[] | No | References to Product IDs in cart |
| `orders` | OrderSchema[] | No | Array of order documents |
| `password` | String | No | Hashed password (only for email/password auth) |
| `image` | String | No | Profile image URL (from Google OAuth) |
| `role` | String | No | User role: "user" or "admin" |

### Nested Schema: OrderSchema

```typescript
{
  product_id: ObjectId (required),
  status: String (enum: ["pending", "shipped", "delivered", "cancelled"], default: "pending"),
  order_date: Date (default: current date)
}
```

### Usage Example
```typescript
import User from "@/models/User";

// Create a new user
const user = await User.create({
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  password: hashedPassword, // bcrypt hashed
  role: "user"
});

// Add to cart
user.cart.push(productId);
await user.save();

// Create order
user.orders.push({
  product_id: productId,
  status: "pending",
  order_date: new Date()
});
await user.save();
```

---

## Product Model

**File**: `models/Product.ts`

### Schema Structure
```typescript
{
  product_id: String (required, unique),
  name: String (required),
  img: String (required),
  price: Number (required),
  size_boolean: Boolean (default: false),
  stock: StockSchema[] (default: []),
  stock_quantity: Number (default: 0)
}
```

### Field Details

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `product_id` | String | Yes | Unique product identifier |
| `name` | String | Yes | Product name |
| `img` | String | Yes | Product image URL |
| `price` | Number | Yes | Product price |
| `size_boolean` | Boolean | No | Whether product has size variations |
| `stock` | StockSchema[] | No | Size-specific inventory tracking |
| `stock_quantity` | Number | No | Total available stock |

### Nested Schema: StockSchema

```typescript
{
  size: String (required),
  quantity: Number (required)
}
```

### Usage Example
```typescript
import Product from "@/models/Product";

// Create a new product
const product = await Product.create({
  product_id: "PROD-001",
  name: "T-Shirt",
  img: "https://example.com/tshirt.jpg",
  price: 29.99,
  size_boolean: true,
  stock: [
    { size: "S", quantity: 10 },
    { size: "M", quantity: 15 },
    { size: "L", quantity: 8 }
  ],
  stock_quantity: 33
});

// Find product
const found = await Product.findOne({ product_id: "PROD-001" });

// Update stock
found.stock[0].quantity -= 1; // Reduce S size by 1
found.stock_quantity -= 1;
await found.save();
```

---

## Additional Fields (Referenced but not shown in current schemas)

### ReviewSchema (Referenced in Product but not implemented)
```typescript
{
  user: ObjectId (ref: "User"),
  review_content: String,
  rating: Number (min: 1, max: 5),
  timestamps: true
}
```

This suggests reviews functionality is planned but not yet integrated into the main Product schema.

---

## Database Relationships

```
User (one-to-many) ←→ Orders
  └─ Each user can have multiple orders

User (one-to-many) ←→ Product (through cart)
  └─ Users have a cart array containing product IDs

Product (one-to-many) ←→ Reviews (planned)
  └─ Products can have multiple reviews
```

---

## Key Constraints & Features

✅ **Email Uniqueness**: User emails are unique to prevent duplicate accounts  
✅ **Timestamps**: Both User and nested schemas track creation and modification times  
✅ **Role-Based Access**: Users can be "user" or "admin" for different permissions  
✅ **Stock Management**: Products track both individual size quantities and total stock  
✅ **Flexible Authentication**: Supports both password-based and OAuth (Google) logins  
✅ **Cart System**: Users maintain a list of product IDs they want to purchase  
✅ **Order Tracking**: Orders are embedded in user documents with status tracking  

---

## Future Improvements
- Implement Reviews in Product model
- Add product categories/tags
- Add discount/coupon support
- Add payment information in orders
- Add product images array (multiple images per product)
