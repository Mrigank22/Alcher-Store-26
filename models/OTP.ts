import mongoose, { Schema, models } from "mongoose";

const OTPSchema = new Schema(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index to automatically delete expired OTPs
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default models.OTP || mongoose.model("OTP", OTPSchema);
