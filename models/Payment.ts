import mongoose, { Schema, models } from "mongoose";

/**
 * Payment Schema
 * Stores all payment transaction records
 * Useful for reconciliation and audit trails
 */
const PaymentSchema = new Schema(
  {
    // Link to order
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Payment gateway details
    gateway: {
      type: String,
      enum: ["razorpay", "mock"],
      required: true,
    },

    // Razorpay specific fields
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },

    // Payment details
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["created", "attempted", "success", "failed", "refunded"],
      default: "created",
    },

    // Transaction metadata
    method: {
      type: String, // card, netbanking, upi, etc.
      default: null,
    },
    errorCode: {
      type: String,
      default: null,
    },
    errorDescription: {
      type: String,
      default: null,
    },

    // Additional tracking
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },

    // Timestamps
    attemptedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for quick lookups
PaymentSchema.index({ razorpayOrderId: 1 });
PaymentSchema.index({ order: 1 });
PaymentSchema.index({ user: 1 });

export default models.Payment || mongoose.model("Payment", PaymentSchema);
