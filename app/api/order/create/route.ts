import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import TempCart from "@/models/TempCart";
import Product from "@/models/Product";
import { getDeliveryConfig } from "@/lib/getDeliveryConfig";
import Media from "@/models/Media";

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
    const { shippingAddress, notes = "", isDirect = false, deliveryFee } = body;

    // Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.name ||
      !shippingAddress.phone ||
      !shippingAddress.addressLine1 ||
      !shippingAddress.district ||
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
    
    // Import User model to find or create user
    const User = (await import("@/models/User")).default;
    let user = await User.findOne({ email: session.user.email });
    
    // If user doesn't exist in DB, create them
    if (!user) {
      user = await User.create({
        email: session.user.email,
        name: session.user.name || shippingAddress.name || "User",
        phone: shippingAddress.phone || "",
        image: session.user.image || "",
      });
    }

    // Get user's cart - either TempCart (for direct buy) or regular Cart
    const cart = isDirect
      ? await TempCart.findOne({ user_email: session.user.email }).populate("items.product")
      : await Cart.findOne({ user_email: session.user.email }).populate("items.product");

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

      // Check stock for selected variant
      const variant = product.variants.find(
        (v: any) => 
          (!product.hasSize || v.size === item.size) &&
          (!product.hasColor || v.color === item.colour)
      );

      if (!variant || variant.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for ${product.name}${item.size ? ` (Size: ${item.size})` : ''}${item.colour ? ` (Color: ${item.colour})` : ''}`,
          },
          { status: 400 }
        );
      }
    }

    // Prepare order items with snapshot of product data
    // Collect all media IDs to fetch URLs
    const mediaIds = new Set<string>();
    for (const item of cart.items) {
      const images = item.product?.images || [];
      images.forEach((id: any) => mediaIds.add(String(id)));
    }

    // Fetch media documents with URLs
    const mediaDocs = await Media.find({
      _id: { $in: Array.from(mediaIds) },
    }).lean();

    const mediaMap: Record<string, string> = {};
    for (const m of mediaDocs) {
      mediaMap[String(m._id)] = `/api/media/${m.filename}`;
    }

    const orderItems = cart.items.map((item: any) => {
      // Extract image URL using the mediaMap
      let imageUrl = "/placeholder.png";
      
      if (item.product.images && item.product.images.length > 0) {
        const imageIndex = item.product.primaryImageIndex ?? 0;
        const imageId = item.product.images[imageIndex] || item.product.images[0];
        
        // Look up the URL from the media map
        if (mediaMap[String(imageId)]) {
          imageUrl = mediaMap[String(imageId)];
        } else if (typeof imageId === 'string' && imageId.startsWith('http')) {
          // If it's already a URL, use it
          imageUrl = imageId;
        }
      }
      
      return {
        product: item.product._id,
        productName: item.product.name,
        productImage: imageUrl,
        productType: item.product.productType,
        quantity: item.quantity,
        size: item.size,
        colour: item.colour,
        price: item.price,
        subtotal: item.price * item.quantity,
      };
    });

    // Calculate totals
    const subtotal = orderItems.reduce(
      (sum: number, item: any) => sum + item.subtotal,
      0
    );

    // Set delivery fee from checkout (default to 1 if not provided)
    const shippingCost = typeof deliveryFee === "number" ? deliveryFee : 1;

    const tax = Math.round(subtotal); // 18% GST
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

    // Find order by orderId string (e.g., "ORD-20251229-55020")
    const order = await Order.findOne({ orderId }).populate("items.product").lean();

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

    // Enrich product images if they're still ObjectIds
    const mediaIds = new Set<string>();
    for (const item of order.items) {
      // Check if productImage is an ObjectId (24 character hex string)
      if (item.productImage && /^[0-9a-fA-F]{24}$/.test(item.productImage)) {
        mediaIds.add(item.productImage);
      }
    }

    if (mediaIds.size > 0) {
      const mediaDocs = await Media.find({
        _id: { $in: Array.from(mediaIds) },
      }).lean();

      const mediaMap: Record<string, string> = {};
      for (const m of mediaDocs) {
        mediaMap[String(m._id)] = `/api/media/${m.filename}`;
      }

      // Replace ObjectIds with URLs
      for (const item of order.items) {
        if (item.productImage && mediaMap[item.productImage]) {
          item.productImage = mediaMap[item.productImage];
        }
      }
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
