import { NextResponse } from "next/server";
import OTP from "@/models/OTP";
import TempUser from "@/models/TempUser";
import { connectDB } from "@/lib/mongodb";
import { sendOTPEmail } from "@/lib/email";

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json(
      { message: "Email is required" },
      { status: 400 }
    );
  }

  await connectDB();

  // Check if temp user exists
  const tempUser = await TempUser.findOne({ email });
  
  if (!tempUser) {
    return NextResponse.json(
      { message: "Registration data not found. Please start registration again." },
      { status: 400 }
    );
  }

  // Generate new OTP
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Delete old OTP and create new one
  await OTP.deleteMany({ email });
  await OTP.create({
    email,
    otp,
    expiresAt,
    verified: false,
  });

  // Update temp user expiration
  tempUser.expiresAt = expiresAt;
  await tempUser.save();

  // Send new OTP via email
  const emailResult = await sendOTPEmail(email, otp);
  
  if (!emailResult.success) {
    return NextResponse.json(
      { message: "Failed to send OTP email. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "New OTP sent to your email!" },
    { status: 200 }
  );
}
