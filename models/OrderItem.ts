import mongoose, { Schema, models } from "mongoose";

const OrderItemSchema = new Schema(
  {
    user: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    product: { 
      type: Schema.Types.ObjectId, 
      ref: "Product", 
      required: true 
    },
    size: { 
      type: String, 
      default: null 
    },
    quantity: { 
      type: Number, 
      required: true, 
      min: 1 
    },
    // This is the calculated field you requested (price * quantity)
    cost: { 
      type: Number, 
      required: true 
    },
    status: {
        type: String,
        enum: ["cart", "ordered"], // 'cart' means it's sitting in the cart, 'ordered' means paid for
        default: "cart"
    }
  },
  { timestamps: true }
);

export default models.OrderItem || mongoose.model("OrderItem", OrderItemSchema);