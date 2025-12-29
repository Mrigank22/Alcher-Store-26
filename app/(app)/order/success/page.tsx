"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AuthLayout from "@/components/AuthLayout";

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

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

  const downloadInvoice = async () => {
    if (!orderId) return;

    setDownloadingInvoice(true);
    try {
      const response = await fetch(`/api/invoice/generate?orderId=${orderId}`);
      const result = await response.json();

      if (result.success && result.data.invoiceUrl) {
        // Open the PDF in a new tab
        window.open(result.data.invoiceUrl, "_blank");
      } else {
        console.error("Invoice fetch failed:", result.message);
        // Retry fetching order details to check if invoice is now available
        await fetchOrderDetails();
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
    } finally {
      setDownloadingInvoice(false);
    }
  };

  if (loading) {
    return (
      <AuthLayout>
        <div className="flex justify-center items-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <p className="text-gray-700 text-lg">Loading order details...</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (!orderDetails) {
    return (
      <AuthLayout>
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h1>
          <Link href="/" className="text-green-600 hover:underline font-medium">
            Return to Home
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-2xl mx-auto px-4 relative z-30">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="text-center pt-8 pb-6 px-6">
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">
              PAYMENT SUCCESSFUL !
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Thank you for your order. Your items are being packed and will be shipped soon.{" "}
              <span className="font-semibold">You can track your order in your profile section.</span>
            </p>
          </div>

          {/* Download Invoice Button */}
          <div className="flex justify-center pb-6">
            {orderDetails.invoiceUrl ? (
              <button 
                onClick={downloadInvoice}
                disabled={downloadingInvoice}
                className="bg-[#2D5F2E] hover:bg-[#1e4620] text-white font-medium px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingInvoice ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Download Invoice
                  </>
                )}
              </button>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-2.5 rounded-lg flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Invoice generating... Please complete payment
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 mx-6"></div>

          {/* Contact and Address Grid */}
          <div className="grid md:grid-cols-2 gap-4 p-6">
            {/* Contact Details */}
            <div className="border border-gray-300 rounded-xl p-4">
              <h3 className="font-bold text-black mb-3 text-base">Contact Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Full Name</p>
                  <p className="text-gray-800 font-medium">{orderDetails.shippingAddress.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Phone Number</p>
                  <p className="text-gray-800 font-medium">{orderDetails.shippingAddress.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Email</p>
                  <p className="text-gray-800 font-medium">{orderDetails.shippingAddress?.email || orderDetails.user?.email || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="border border-gray-300 rounded-xl p-4">
              <h3 className="font-bold text-black mb-3 text-base">Address</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Address Line 1</p>
                  <p className="text-gray-800 font-medium">{orderDetails.shippingAddress.addressLine1}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Address Line 2</p>
                  <p className="text-gray-800 font-medium">
                    {orderDetails.shippingAddress.addressLine2 || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">City, State, Pincode</p>
                  <p className="text-gray-800 font-medium">
                    {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state},{" "}
                    {orderDetails.shippingAddress.pincode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="px-6 pb-6 space-y-3">
            {orderDetails.items.map((item: any, index: number) => (
              <div
                key={index}
                className="border border-gray-300 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 relative overflow-hidden">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Product Details */}
                  <div>
                    <h4 className="font-bold text-black text-base">{item.productName}</h4>
                    <div className="text-xs text-gray-600 space-y-0.5 mt-1">
                      <p>T Shirt</p>
                      <p>Size: {item.size || "M"}</p>
                      <p>Quantity: {item.quantity}</p>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right">
                  <p className="font-bold text-black text-lg">₹{item.subtotal}.00</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Buttons */}
          <div className="grid grid-cols-2 gap-4 px-6 pb-6">
            <Link
              href="/orders"
              className="bg-[#2D5F2E] hover:bg-[#234A24] text-white font-semibold py-3 rounded-lg text-center transition-colors"
            >
              Your Orders
            </Link>
            <Link
              href="/"
              className="bg-[#D4E8D4] hover:bg-[#C0DFC0] text-gray-800 font-semibold py-3 rounded-lg text-center transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
