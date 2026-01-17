import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import DeliveryConfigModel from "@/models/DeliveryConfig";

export async function GET(req: NextRequest) {
  await connectDB();
  // Get the first (or only) delivery config document
  const config = await DeliveryConfigModel.findOne();
  if (!config) {
    return NextResponse.json({ fee: 0 });
  }
  return NextResponse.json({ fee: config.deliveryFee });
}
