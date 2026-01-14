"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import OrderFeedback from "@/components/reviews/OrderFeedback";

interface Order {
  _id: string;
  orderId: string;
  items: Array<{
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
    subtotal: number;
    size?: string;
  }>;
  totalAmount: number;
  deliveryCharge?: number;
  subtotalAmount?: number;
  shippingCost?: number;
  tax?: number;
  status: string;
  paymentStatus: string;
  orderDate?: string;
  createdAt?: string;
  shippingAddress: {
    name: string;
    addressLine1?: string;
    city: string;
    state: string;
    pincode?: string;
  };
  contactDetails?: {
    name: string;
    email: string;
    phone: string;
  };
  trackingId?: string;
  expectedDelivery?: string;
  invoiceUrl?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchOrders();
      fetchUserData();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      console.log('[Profile] Fetching user data, session:', session?.user);
      const response = await fetch("/api/auth/user");
      const result = await response.json();
      console.log('[Profile] User data response:', result);
      
      if (result.success && result.user) {
        setUserPhone(result.user.phone || null);
        // Use user image from DB, fallback to session image (for Google OAuth)
        const imageUrl = result.user.image || session?.user?.image || null;
        console.log('[Profile] Setting user image:', imageUrl);
        setUserImage(imageUrl);
      }
    } catch (error) {
      console.error("[Profile] Error fetching user data:", error);
      // If API fails, try to use session image
      if (session?.user?.image) {
        console.log('[Profile] Using session image as fallback:', session.user.image);
        setUserImage(session.user.image);
      }
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      const result = await response.json();

      console.log('[Profile] Orders fetched:', result);

      if (result.success) {
        console.log('[Profile] First order items:', result.data[0]?.items);
        setOrders(result.data);
      }
    } catch (error) {
      console.error("[Profile] Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const downloadInvoice = async (orderId: string) => {
    setDownloadingInvoice(orderId);
    try {
      const response = await fetch(`/api/invoice/generate?orderId=${orderId}`);
      const result = await response.json();

      if (result.success && result.data.invoiceUrl) {
        window.open(result.data.invoiceUrl, "_blank");
      } else {
        alert("Invoice not available yet. Please try again later.");
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Failed to download invoice");
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const getStatusMessage = (status: string) => {
    const messages: { [key: string]: string } = {
      pending: "Order Placed, Processing",
      confirmed: "Order Confirmed, Preparing",
      processing: "Order Processing",
      shipped: "Order Received, Getting Shipped",
      delivered: "Order Delivered",
      cancelled: "Order Cancelled",
    };
    return messages[status] || "Order Status Unknown";
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F0FAF0]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      <div className="min-h-screen bg-[#F0FAF0] py-8 pt-24">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Your Orders</h1>
            <p className="text-gray-600 mt-2">{orders.length} {orders.length === 1 ? 'item' : 'items'} are added</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - User Profile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              {/* Profile Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {userImage ? (
                    <Image
                      src={userImage}
                      alt={session?.user?.name || "User"}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      unoptimized
                      onError={(e) => {
                        console.error('[Profile] Image failed to load:', userImage);
                      }}
                    />
                  ) : (
                    <svg
                      className="w-12 h-12 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {/* User Name */}
              <h2 className="text-xl font-bold text-center mb-6 text-gray-900">
                {session?.user?.name || "User"}
              </h2>

              {/* User Details */}
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="text-sm text-gray-900 break-all">
                    {session?.user?.email}
                  </p>
                </div>
                {userPhone && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                    <p className="text-sm text-gray-900">
                      {userPhone}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-medium py-3 rounded-lg transition-colors">
                  Change Password
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full bg-red-100 hover:bg-red-200 text-red-800 font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Log Out
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right Content - Orders */}
          <div className="lg:col-span-3">
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <p className="text-xl text-gray-600 mb-4">No orders yet</p>
                <Link
                  href="/products"
                  className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Order #{order.orderId}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Ordered on{" "}
                          {new Date(order.orderDate || order.createdAt || Date.now()).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className={`text-sm font-semibold mt-1 ${
                          order.paymentStatus === "completed" || order.paymentStatus === "paid" 
                            ? "text-emerald-600" 
                            : order.paymentStatus === "failed" || order.paymentStatus === "refunded"
                            ? "text-red-600"
                            : order.paymentStatus === "processing"
                            ? "text-blue-600"
                            : "text-yellow-600"
                        }`}>
                          Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gray-900">
                          {order.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Order Content */}
                    <div className="p-6">
                      {/* Contact Details and Address Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-emerald-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">
                            Contact Details
                          </h4>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-700">
                              {order.contactDetails?.name || order.shippingAddress.name}
                            </p>
                            <p className="text-gray-700">
                              {order.contactDetails?.email || session?.user?.email}
                            </p>
                          </div>
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">Address</h4>
                          <div className="text-sm text-gray-700">
                            <p>{order.shippingAddress.addressLine1 || `Address Line 1`}</p>
                            <p>
                              {order.shippingAddress.city}, {order.shippingAddress.state}
                            </p>
                            <p>
                              India, {order.shippingAddress.pincode || "248001"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Product Items */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div
                            key={index}
                            className="flex gap-3 bg-gray-50 rounded-lg p-3"
                          >
                            <div className="w-20 h-20 bg-gray-300 rounded-lg flex-shrink-0 overflow-hidden">
                              {item.productImage && typeof item.productImage === 'string' && item.productImage.trim() !== '' ? (
                                <Image
                                  src={item.productImage}
                                  alt={item.productName}
                                  width={80}
                                  height={80}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                  No Image
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-sm text-gray-900 truncate">
                                {item.productName}
                              </h5>
                              <p className="text-xs text-gray-600 mt-1">
                                {item.size || "Size: M"}
                              </p>
                              <p className="text-xs text-gray-600">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Status */}
                      <div className="bg-emerald-50 rounded-lg p-4 mb-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg mb-1">
                            {getStatusMessage(order.status)}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Tracking ID: {order.trackingId || "XXXXXXXXXXXX"}
                          </p>
                          <p className="text-sm text-gray-600">
                            Expected delivery by{" "}
                            {order.expectedDelivery ||
                              new Date(
                                new Date(order.orderDate || order.createdAt || Date.now()).getTime() +
                                  7 * 24 * 60 * 60 * 1000
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                          </p>
                        </div>
                        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                          Track Order
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                      {/* Feedback Section (only after delivery) */}
{order.status === "delivered" && (
  <div className="mt-6 border-t pt-6">
    <OrderFeedback orderId={order._id} />
  </div>
)}


                      {/* Collapsible Details Section */}
                      {expandedOrders.has(order._id) && (
                        <div className="border-t pt-4 mt-4">
                          {/* Contact Information */}
                          <div className="mb-6">
                            <h4 className="font-bold text-gray-900 mb-3">
                              ANY TROUBLE WITH THE ORDER?
                            </h4>
                            <p className="font-semibold text-gray-900 mb-2">
                              CONTACT OUR TEAM
                            </p>
                            <div className="space-y-1 text-sm text-gray-700">
                              <p>Call Us: +91 9876543210</p>
                              <p>WhatsApp: +91 9876543210</p>
                              <p>Mail: something.mail@domain.com</p>
                            </div>
                          </div>

                          {/* Order Summary */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-bold text-gray-900 mb-3">
                              ORDER SUMMARY
                            </h4>
                            <div className="space-y-2">
                              {order.items.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between text-sm"
                                >
                                  <span className="text-gray-700">
                                    {item.productName} {item.size} x{item.quantity}
                                  </span>
                                  <span className="text-gray-900 font-medium">
                                    {item.subtotal.toFixed(2)}
                                  </span>
                                </div>
                              ))}
                              <div className="border-t pt-2 mt-2"></div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-700">Subtotal</span>
                                <span className="text-gray-900 font-medium">
                                  ₹{(order.subtotalAmount || order.totalAmount - (order.shippingCost || order.deliveryCharge || 0) - (order.tax || 0)).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                  Delivery Charges
                                </span>
                                <span className="text-gray-900 font-medium">
                                  ₹{(order.shippingCost || order.deliveryCharge || 0).toFixed(2)}
                                </span>
                              </div>
                              {order.tax && order.tax > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-700">Tax</span>
                                  <span className="text-gray-900 font-medium">
                                    ₹{order.tax.toFixed(2)}
                                  </span>
                                </div>
                              )}
                              <div className="border-t pt-2 mt-2"></div>
                              <div className="flex justify-between text-lg font-bold">
                                <span className="text-gray-900">Total</span>
                                <span className="text-gray-900">
                                  ₹{order.totalAmount.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 mt-4">
                        <button
                          onClick={() => downloadInvoice(order.orderId)}
                          disabled={downloadingInvoice === order.orderId}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          {downloadingInvoice === order.orderId ? (
                            <>
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Loading...
                            </>
                          ) : (
                            <>
                              Download Invoice
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => toggleOrderDetails(order._id)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          {expandedOrders.has(order._id) ? "Hide" : "More"} Details
                          <svg
                            className={`w-4 h-4 transform transition-transform ${
                              expandedOrders.has(order._id) ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
