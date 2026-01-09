import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email }).select(
      "name email phone image"
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
