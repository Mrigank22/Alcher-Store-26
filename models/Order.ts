import mongoose, { Schema, models } from "mongoose";

/**
 * Order Item Schema
 * Snapshot of items at the time of order creation
 */
const OrderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: {
    type: String,
    required: true, // Store name in case product is deleted later
  },
  productImage: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  size: {
    type: String,
    default: null,
  },
  price: {
    type: Number,
    required: true, // Price at time of purchase
  },
  subtotal: {
    type: Number,
    required: true, // price * quantity
  },
});

/**
 * Order Schema
 * Represents a complete order with payment details
 */
const OrderSchema = new Schema(
  {
    // Order identification
    orderId: {
      type: String,
      unique: true, // Our internal order ID
      // Not required here because it's auto-generated in pre-save hook
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Order items (snapshot from cart at checkout time)
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: any[]) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    // Pricing details
    subtotal: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },

    // Order status
    status: {
      type: String,
      enum: ["pending", "payment_failed", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    // Payment details
    paymentStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "mock", "cod"],
      default: "razorpay",
    },
    razorpayOrderId: {
      type: String, // Razorpay's order ID
      default: null,
    },
    razorpayPaymentId: {
      type: String, // Payment ID after successful payment
      default: null,
    },
    razorpaySignature: {
      type: String, // Signature for verification
      default: null,
    },

    // Shipping details
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },

    // Timestamps for tracking
    orderDate: {
      type: Date,
      default: Date.now,
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    deliveryDate: {
      type: Date,
      default: null,
    },

    // Additional info
    notes: {
      type: String,
      default: "",
    },

    // Invoice
    invoiceUrl: {
      type: String,
      default: null,
    },
    invoiceNumber: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Generate unique order ID before validation
OrderSchema.pre("validate", function () {
  if (this.isNew && !this.orderId) {
    // Generate format: ORD-YYYYMMDD-XXXXX
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(10000 + Math.random() * 90000);
    this.orderId = `ORD-${dateStr}-${random}`;
  }
});

// Clear the model cache if it exists to ensure we use the latest schema
if (models.Order) {
  delete models.Order;
}

export default mongoose.model("Order", OrderSchema);
