"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/order/create?orderId=${orderId}`);
      const result = await response.json();

      if (result.success) {
        setOrderDetails(result.data);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h1>
        <Link href="/" className="text-blue-500 underline">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-green-600 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-gray-600">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
      </div>

      <div className="bg-white border rounded-lg shadow p-6 space-y-4">
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-2">Order Details</h2>
          <p>
            <span className="font-medium">Order Number:</span> {orderDetails.orderId}
          </p>
          <p>
            <span className="font-medium">Order Date:</span>{" "}
            {new Date(orderDetails.orderDate).toLocaleDateString()}
          </p>
          <p>
            <span className="font-medium">Payment Status:</span>{" "}
            <span className="text-green-600 font-semibold">
              {orderDetails.paymentStatus.toUpperCase()}
            </span>
          </p>
        </div>

        <div className="border-b pb-4">
          <h3 className="font-semibold mb-2">Shipping Address</h3>
          <p>{orderDetails.shippingAddress.name}</p>
          <p>{orderDetails.shippingAddress.phone}</p>
          <p>{orderDetails.shippingAddress.addressLine1}</p>
          {orderDetails.shippingAddress.addressLine2 && (
            <p>{orderDetails.shippingAddress.addressLine2}</p>
          )}
          <p>
            {orderDetails.shippingAddress.city},{" "}
            {orderDetails.shippingAddress.state} -{" "}
            {orderDetails.shippingAddress.pincode}
          </p>
        </div>

        <div className="border-b pb-4">
          <h3 className="font-semibold mb-2">Order Items</h3>
          {orderDetails.items.map((item: any, index: number) => (
            <div key={index} className="flex justify-between py-2">
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-gray-600">
                  Qty: {item.quantity} × ₹{item.price}
                  {item.size && ` (Size: ${item.size})`}
                </p>
              </div>
              <p className="font-semibold">₹{item.subtotal}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{orderDetails.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span>
              {orderDetails.shippingCost === 0
                ? "FREE"
                : `₹${orderDetails.shippingCost}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>₹{orderDetails.tax}</span>
          </div>
          <div className="flex justify-between text-xl font-bold border-t pt-2">
            <span>Total Paid:</span>
            <span className="text-green-600">₹{orderDetails.totalAmount}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center space-x-4">
        <Link
          href="/"
          className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Continue Shopping
        </Link>
        <Link
          href="/orders"
          className="inline-block bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
        >
          View My Orders
        </Link>
      </div>
    </div>
  );
}
