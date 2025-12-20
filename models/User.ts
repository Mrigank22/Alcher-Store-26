import mongoose, { Schema, models } from "mongoose";

const OrderSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, required: true },
  status: {
    type: String,
    enum: ["pending", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  order_date: { type: Date, default: Date.now },
});

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, default: "" },
    address: { type: [String], default: [] },
    cart: { type: [Schema.Types.ObjectId], default: [] },
    orders: { type: [OrderSchema], default: [] },
    password: { type: String }, // only for manual signup
    image: { type: String }, // Google OAuth
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
  },
  { timestamps: true }
);

export default models.User || mongoose.model("User", UserSchema);
