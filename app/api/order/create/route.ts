import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

/**
 * POST /api/order/create
 * Create a new order from cart items
 * Body: {
 *   shippingAddress: {
 *     name, phone, addressLine1, addressLine2, city, state, pincode
 *   },
 *   notes?: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { shippingAddress, notes = "" } = body;

    // Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.name ||
      !shippingAddress.phone ||
      !shippingAddress.addressLine1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return NextResponse.json(
        { success: false, message: "Complete shipping address is required" },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Import User model to find user ID
    const User = (await import("@/models/User")).default;
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Get user's cart using user_email
    const cart = await Cart.findOne({ user_email: session.user.email }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    // Validate stock availability for all items
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product ${item.product.name} not found` },
          { status: 404 }
        );
      }

      // Check stock
      if (product.size_boolean && item.size) {
        const stockItem = product.stock.find((s: any) => s.size === item.size);
        if (!stockItem || stockItem.quantity < item.quantity) {
          return NextResponse.json(
            {
              success: false,
              message: `Insufficient stock for ${product.name} (Size: ${item.size})`,
            },
            { status: 400 }
          );
        }
      } else if (!product.size_boolean) {
        if (product.stock_quantity < item.quantity) {
          return NextResponse.json(
            {
              success: false,
              message: `Insufficient stock for ${product.name}`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Prepare order items with snapshot of product data
    const orderItems = cart.items.map((item: any) => ({
      product: item.product._id,
      productName: item.product.name,
      productImage: item.product.img,
      quantity: item.quantity,
      size: item.size,
      price: item.price,
      subtotal: item.price * item.quantity,
    }));

    // Calculate totals
    const subtotal = orderItems.reduce(
      (sum: number, item: any) => sum + item.subtotal,
      0
    );
    
    // You can add logic for shipping and tax calculation
    const shippingCost = subtotal >= 500 ? 0 : 50; // Free shipping above ₹500
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const totalAmount = subtotal + shippingCost + tax;

    // Create order
    const order = new Order({
      user: user._id,
      items: orderItems,
      subtotal,
      shippingCost,
      tax,
      totalAmount,
      shippingAddress,
      notes,
      status: "pending",
      paymentStatus: "pending",
    });

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      data: {
        orderId: order._id,
        orderNumber: order.orderId,
        totalAmount: order.totalAmount,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/order/create
 * Get order details by order ID
 * Query: ?orderId=xxx
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Import User model to find user ID
    const User = (await import("@/models/User")).default;
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Find order by orderId (string) not _id (ObjectId)
    const order = await Order.findOne({ orderId }).populate("items.product");

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Verify order belongs to user
    if (order.user.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access to order" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
