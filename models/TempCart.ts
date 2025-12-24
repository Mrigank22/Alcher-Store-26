import mongoose, { Schema, models } from "mongoose";

// This schema must match your team's Cart schema exactly
// so the Frontend Checkout page can read it without errors.

const TempCartItem = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  size: { type: String },
  colour: { type: String }, // Included to match team's structure
  quantity: { type: Number, required: true, min: 1, default: 1 },
  price: { type: Number, required: true }, // Snapshot of price at that moment
});

const TempCartSchema = new Schema(
  {
    user_email: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true, 
      lowercase: true 
    },
    items: { type: [TempCartItem], default: [] },
    total_quantity: { type: Number, default: 0 },
    total_price: { type: Number, default: 0 },
    
    // AUTO-DELETE: This document vanishes 1 hour (3600s) after creation
    createdAt: { type: Date, default: Date.now, expires: 3600 } 
  },
  { timestamps: true }
);

export default models.TempCart || mongoose.model("TempCart", TempCartSchema);