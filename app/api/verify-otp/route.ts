import { NextResponse } from "next/server";
import User from "@/models/User";
import OTP from "@/models/OTP";
import TempUser from "@/models/TempUser";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: Request) {
  const { email, otp } = await req.json();
  
  if (!email || !otp) {
    return NextResponse.json(
      { message: "Email and OTP are required" },
      { status: 400 }
    );
  }

  await connectDB();

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

  // Check if OTP was already verified
  if (otpRecord.verified) {
    return NextResponse.json(
      { message: "OTP already used" },
      { status: 400 }
    );
  }

  // Find the temporary user data
  const tempUser = await TempUser.findOne({ email });

  if (!tempUser) {
    return NextResponse.json(
      { message: "Registration data not found. Please start registration again." },
      { status: 400 }
    );
  }

  // Create the actual user
  await User.create({
    name: tempUser.name,
    email: tempUser.email,
    phone: tempUser.phone,
    password: tempUser.password, // Already hashed
    cart: [],
    address: [],
    orders: [],
  });

  // Mark OTP as verified and delete temp data
  otpRecord.verified = true;
  await otpRecord.save();
  await TempUser.deleteOne({ email });

  return NextResponse.json(
    { message: "Registration successful! You can now login." },
    { status: 201 }
  );
}
