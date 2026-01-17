"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
import { getDeliveryConfig } from "@/lib/getDeliveryConfig";

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    img?: string;
    images: string[];
    primaryImageIndex?: number;
    price: number;
  };
  quantity: number;
  size: string | null;
  colour?: string | null;
  price: number;
}

interface ShippingAddress {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  district: string;
  city: string;
  state: string;
  pincode: string;
}

// Separate component that uses useSearchParams
function CheckoutContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(2);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    district: "",
    city: "",
    state: "",
    pincode: "",
  });
  const calculateTotals = (items: CartItem[]) => {
    const sub = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = deliveryFee;
    const taxAmount = 0;
    const totalAmount = sub + shipping + taxAmount;

    setSubtotal(sub);
    setShippingCost(shipping);
    setTax(taxAmount);
    setTotal(totalAmount);
  };
  const fetchCart = async () => {
    try {
      if (!session?.user?.email) return;

      // Set delivery fee to 1 rupee
      setDeliveryFee(2);

      // Start progress simulation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const isDirectBuy = searchParams.get("type") === "direct";

      const endpoint = isDirectBuy
          ? "/api/temp-order-cart"
          : `/api/cart?email=${session.user.email}`;

      const response = await fetch(endpoint);
      const result = await response.json();

      // Clear interval and set to 100%
      clearInterval(progressInterval);
      setProgress(100);

      if (result && result.items && result.items.length > 0) {
        setCartItems(result.items);
        calculateTotals(result.items);
      } else {
        setCartItems([]);
      }

      // Small delay to show 100% before hiding
      setTimeout(() => {
        setLoading(false);
      }, 300);

    } catch (error) {
      console.error("Error fetching cart:", error);
      alert("Failed to load checkout items");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.email) {
      void fetchCart();
    }
  }, [status, session]);



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const validateAddress = () => {
    if (
        !shippingAddress.name ||
        !shippingAddress.phone ||
        !shippingAddress.addressLine1 ||
        !shippingAddress.district ||
        !shippingAddress.city ||
        !shippingAddress.state ||
        !shippingAddress.pincode
    ) {
      alert("Please fill all required fields");
      return false;
    }
    return true;
  };

  const handleCheckout = async () => {
    if (!validateAddress()) return;

    if (!cartItems || cartItems.length === 0) {
      alert("No items to checkout.");
      router.push("/");
      return;
    }

    if (!session?.user?.email) {
      alert("User email not found. Please login again.");
      return;
    }

    setProcessing(true);

    try {
      const isDirectBuy = searchParams.get("type") === "direct";

      const orderResponse = await fetch("/api/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: {
            ...shippingAddress,
            email: session.user.email,
          },
          isDirect: isDirectBuy,
          deliveryFee, // Pass deliveryFee to backend
        }),
      });

      const orderResult = await orderResponse.json();

      if (!orderResult.success) {
        alert(orderResult.message || "Failed to create order");
        setProcessing(false);
        return;
      }

      const { orderId } = orderResult.data;

      // Handle SBI payment - redirect to alcheringa.iitg.ac.in/store
      await handleSBIPayment(orderId);
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred during checkout");
      setProcessing(false);
    }
  };

  const handleSBIPayment = async (orderId: string) => {
    try {
      // Call backend to create SBI payment
      const response = await fetch("/api/payment/sbi-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          paymentMode: "UPI",
        }),
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.message || "Failed to create SBI payment");
        setProcessing(false);
        return;
      }

      // Redirect to alcheringa.iitg.ac.in/store with encrypted data
      const cardsPortalUrl = new URL(result.data.cardsPortalUrl);
      cardsPortalUrl.searchParams.set("EncryptTrans", result.data.EncryptTrans);
      cardsPortalUrl.searchParams.set("merchIdVal", result.data.merchIdVal);
      cardsPortalUrl.searchParams.set("sbiTransactionId", result.data.sbiTransactionId);
      cardsPortalUrl.searchParams.set("orderNumber", result.data.orderNumber);
      cardsPortalUrl.searchParams.set("amount", result.data.amount.toString());

      console.log("Redirecting to:", cardsPortalUrl.toString());

      // Redirect to cards_portal (alcheringa.iitg.ac.in/store)
      window.location.href = cardsPortalUrl.toString();
    } catch (error) {
      console.error("SBI payment error:", error);
      alert("Failed to initiate SBI payment");
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingScreen progress={progress} />;
  }

  return (
      <div className="min-h-screen bg-[#F0FAF0]">
        {/* Navbar */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 pt-24 max-w-6xl">
          {/* Tabs */}
          <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8 overflow-x-auto">
            <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base md:text-lg font-semibold whitespace-nowrap">
              <span>Cart</span>
              <span className="text-xl sm:text-2xl"></span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base md:text-lg font-semibold text-gray-600 whitespace-nowrap">
              <span>Delivery Address</span>
              <span className="text-xl sm:text-2xl"></span>
            </div>
          </div>

          {cartItems.length === 0 ? (
              <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
                <p className="text-gray-700 mb-4">Your cart is empty.</p>
                <button
                    onClick={() => router.push("/")}
                    className="bg-[#2D5F2E] text-white px-6 py-2 rounded-lg hover:bg-[#234A24]"
                >
                  Continue Shopping
                </button>
              </div>
          ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Shipping Form - Takes 2 columns */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg">
                  {/* Contact Information */}
                  <div className="mb-6">
                    <h2 className="text-base md:text-lg font-bold mb-4">Contact Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder=""
                            value={shippingAddress.name.split(" ")[0] || shippingAddress.name}
                            onChange={(e) => {
                              const lastName = shippingAddress.name.split(" ").slice(1).join(" ");
                              handleInputChange({
                                ...e,
                                target: {
                                  ...e.target,
                                  name: "name",
                                  value: `${e.target.value} ${lastName}`.trim(),
                                },
                              } as any);
                            }}
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                            type="text"
                            placeholder=""
                            value={shippingAddress.name.split(" ").slice(1).join(" ")}
                            onChange={(e) => {
                              const firstName = shippingAddress.name.split(" ")[0] || "";
                              handleInputChange({
                                target: {
                                  name: "name",
                                  value: `${firstName} ${e.target.value}`.trim(),
                                },
                              } as any);
                            }}
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                          type="tel"
                          name="phone"
                          placeholder=""
                          value={shippingAddress.phone}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                      />
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <h2 className="text-base md:text-lg font-bold mb-4">Delivery Address</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Address Line 1
                        </label>
                        <input
                            type="text"
                            name="addressLine1"
                            placeholder=""
                            value={shippingAddress.addressLine1}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Address Line 2
                        </label>
                        <input
                            type="text"
                            name="addressLine2"
                            placeholder=""
                            value={shippingAddress.addressLine2}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            Country
                          </label>
                          <input
                              type="text"
                              placeholder="India"
                              defaultValue="India"
                              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            State
                          </label>
                          <input
                              type="text"
                              name="state"
                              placeholder=""
                              value={shippingAddress.state}
                              onChange={handleInputChange}
                              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              required
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            District
                          </label>
                          <input
                              type="text"
                              name="district"
                              placeholder=""
                              value={shippingAddress.district}
                              onChange={handleInputChange}
                              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                              type="text"
                              name="city"
                              placeholder=""
                              value={shippingAddress.city}
                              onChange={handleInputChange}
                              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              required
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            Pincode
                          </label>
                          <input
                              type="text"
                              name="pincode"
                              placeholder=""
                              value={shippingAddress.pincode}
                              onChange={handleInputChange}
                              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Order Summary - Takes 1 column */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg h-fit">
                  <h2 className="text-base md:text-lg font-bold mb-4">Order Summary</h2>

                  <div className="space-y-4 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Charges</span>
                      <span className="font-medium">₹{shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">GST (0%)</span>
                      <span className="font-medium">₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-[#2D5F2E]">₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Coupon Section */}
                  <div className="mb-4">
                    <h3 className="text-xs sm:text-sm font-bold mb-2">Coupon</h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                          type="text"
                          placeholder="Enter Code"
                          className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button className="bg-[#2D5F2E] text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-[#234A24] w-full sm:w-auto">
                        Submit
                      </button>
                    </div>
                  </div>

                  {/* Proceed Button */}
                  <button
                      onClick={handleCheckout}
                      disabled={processing}
                      className="w-full bg-[#2D5F2E] text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-[#234A24] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {processing ? "Processing..." : "Proceed to Payment"}
                  </button>
                </div>
              </div>
          )}
        </div>
      </div>
  );
}

// Main page component with Suspense wrapper
export default function CheckoutPage() {
  return (
      <Suspense fallback={<LoadingScreen progress={0} />}>
        <CheckoutContent />
      </Suspense>
  );
}