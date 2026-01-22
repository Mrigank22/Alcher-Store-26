
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET() {
  await connectDB();

  try {
    const orders = await Order.find({ orderStatus: 'confirmed' })
      .sort({ orderDate: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching confirmed orders:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
