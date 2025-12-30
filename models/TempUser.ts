import mongoose, { Schema, models } from "mongoose";

// Temporary storage for user data during registration
const TempUserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: "" },
    password: { type: String, required: true }, // Already hashed
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Auto-delete after expiration
TempUserSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default models.TempUser || mongoose.model("TempUser", TempUserSchema);
