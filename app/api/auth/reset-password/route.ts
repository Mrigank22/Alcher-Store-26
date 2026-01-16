import { NextResponse } from "next/server";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { connectDB } from "@/lib/mongodb";
import { sendOTPEmail } from "@/lib/email";
import bcrypt from "bcrypt";

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  const { email, otp, newPassword, action } = await req.json();
  
  if (!email) {
    return NextResponse.json(
      { message: "Email is required" },
      { status: 400 }
    );
  }

  await connectDB();

  // ACTION 1: Send OTP
  if (action === "send-otp" || (!otp && !newPassword)) {
    // Check if user exists
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json(
        { message: "No account found with this email address." },
        { status: 404 }
      );
    }

    // Check if user registered with Google OAuth
    if (!user.password) {
      return NextResponse.json(
        { message: "This account was created with Google. Please use 'Continue with Google' to login." },
        { status: 400 }
      );
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old OTPs for this email and create new one
    await OTP.deleteMany({ email });
    await OTP.create({
      email,
      otp: otpCode,
      expiresAt,
      verified: false,
    });

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otpCode);
    
    if (!emailResult.success) {
      return NextResponse.json(
        { message: "Failed to send OTP email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "OTP sent to your email successfully!" },
      { status: 200 }
    );
  }

  // ACTION 2: Verify OTP
  if (action === "verify-otp" || (otp && !newPassword)) {
    // Find the OTP record
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return NextResponse.json(
        { message: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { message: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark OTP as verified (but don't delete yet - needed for password reset)
    otpRecord.verified = true;
    await otpRecord.save();

    return NextResponse.json(
      { message: "OTP verified successfully!" },
      { status: 200 }
    );
  }

  // ACTION 3: Reset Password
  if (otp && newPassword) {
    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Find and verify the OTP
    const otpRecord = await OTP.findOne({ email, otp, verified: true });

    if (!otpRecord) {
      return NextResponse.json(
        { message: "Invalid or unverified OTP" },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { message: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Find the user
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Delete the used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    return NextResponse.json(
      { message: "Password reset successfully! You can now login with your new password." },
      { status: 200 }
    );
  }

  return NextResponse.json(
    { message: "Invalid request" },
    { status: 400 }
  );
}
