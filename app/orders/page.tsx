"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Order {
  _id: string;
  orderId: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
    size?: string;
  }>;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  orderDate: string;
  shippingAddress: {
    name: string;
    city: string;
    state: string;
  };
}

export default function OrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchOrders();
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      const result = await response.json();

      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      payment_failed: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <Link
          href="/"
          className="text-blue-500 hover:text-blue-600 underline"
        >
          ← Back to Shop
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-600 mb-4">No orders yet</p>
          <Link
            href="/"
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Order #{order.orderId}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.orderDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.replace("_", " ").toUpperCase()}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      order.paymentStatus
                    )}`}
                  >
                    {order.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <h4 className="font-medium mb-2">Items:</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-sm"
                    >
                      <span>
                        {item.productName} {item.size && `(${item.size})`} x{" "}
                        {item.quantity}
                      </span>
                      <span className="font-medium">₹{item.subtotal}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Ship to:</p>
                  <p className="font-medium">
                    {order.shippingAddress.name} - {order.shippingAddress.city}
                    , {order.shippingAddress.state}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{order.totalAmount}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <Link
                  href={`/order/success?orderId=${order.orderId}`}
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
