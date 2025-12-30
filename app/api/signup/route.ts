import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import User from "@/models/User";
import OTP from "@/models/OTP";
import TempUser from "@/models/TempUser";
import { connectDB } from "@/lib/mongodb";
import { sendOTPEmail } from "@/lib/email";

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  const { name, lastName, email, password, phone } = await req.json();
  await connectDB();

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json(
      { message: "User already exists" },
      { status: 400 }
    );
  }

  // Generate OTP
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Delete any existing OTPs and temp user data for this email
  await OTP.deleteMany({ email });
  await TempUser.deleteMany({ email });

  // Store OTP in database
  await OTP.create({
    email,
    otp,
    expiresAt,
    verified: false,
  });

  // Hash password and store user data temporarily
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Combine first name and last name
  const fullName = lastName ? `${name} ${lastName}` : name;
  
  await TempUser.create({
    name: fullName,
    email,
    phone: phone || "",
    password: hashedPassword,
    expiresAt,
  });
  
  // Send OTP via email
  const emailResult = await sendOTPEmail(email, otp);
  
  if (!emailResult.success) {
    return NextResponse.json(
      { message: "Failed to send OTP email. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { 
      message: "OTP sent to your email. Please verify to complete registration.",
      email,
    },
    { status: 200 }
  );
}
