"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams
import { useSession } from "next-auth/react";

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    img?: string;
    imageUrl?: string;
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
  city: string;
  state: string;
  pincode: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook to read URL params

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [mockMode, setMockMode] = useState(false);

  // Shipping address form
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.email) {
      fetchCart();
    }
  }, [status, session]);

  const fetchCart = async () => {
    try {
      if (!session?.user?.email) return;

      // CHECK: Is this a direct "Buy Now" checkout?
      const isDirectBuy = searchParams.get("type") === "direct";
      
      // Select the correct API endpoint
      const endpoint = isDirectBuy 
        ? "/api/temp-order-cart" 
        : `/api/cart?email=${session.user.email}`;

      const response = await fetch(endpoint);
      const result = await response.json();

      // Handle response structure (Temp cart vs Main cart might differ slightly in structure but items array is key)
      // Your temp-cart API returns the document directly, main cart returns document too.
      if (result && result.items && result.items.length > 0) {
        setCartItems(result.items);
        calculateTotals(result.items);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      alert("Failed to load checkout items");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = (items: CartItem[]) => {
    const sub = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shipping = sub >= 500 ? 0 : 50;
    const taxAmount = Math.round(sub * 0.18);
    const totalAmount = sub + shipping + taxAmount;

    setSubtotal(sub);
    setShippingCost(shipping);
    setTax(taxAmount);
    setTotal(totalAmount);
  };

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
            email: session.user.email
          },
          isDirect: isDirectBuy 
        }),
      });

      const orderResult = await orderResponse.json();

      if (!orderResult.success) {
        alert(orderResult.message || "Failed to create order");
        setProcessing(false);
        return;
      }

      const { orderId } = orderResult.data;

      const paymentResponse = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, mockMode }),
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResult.success) {
        alert(paymentResult.message || "Failed to initialize payment");
        setProcessing(false);
        return;
      }

      if (mockMode || paymentResult.mockMode) {
        handleMockPayment(paymentResult.data, orderId);
      } else {
        handleRazorpayPayment(paymentResult.data, orderId);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred during checkout");
      setProcessing(false);
    }
  };

  const handleMockPayment = async (paymentData: any, orderId: string) => {
    setTimeout(async () => {
      try {
        const verifyResponse = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: paymentData.orderId,
            razorpay_payment_id: `mock_payment_${Date.now()}`,
            razorpay_signature: "mock_signature",
            mockMode: true,
          }),
        });

        const verifyResult = await verifyResponse.json();

        if (verifyResult.success) {
          alert("✅ Mock Payment Successful!");
          router.push(`/order/success?orderId=${verifyResult.data.orderId}`);
        } else {
          alert("Mock payment verification failed");
          setProcessing(false);
        }
      } catch (error) {
        console.error("Mock payment error:", error);
        alert("Mock payment failed");
        setProcessing(false);
      }
    }, 1500);
  };

  const handleRazorpayPayment = (paymentData: any, orderId: string) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onerror = () => {
      alert("Failed to load Razorpay. Check connection.");
      setProcessing(false);
    };
    script.onload = () => {
      const options = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: "Alcheringa Store",
        description: `Order ${paymentData.orderNumber}`,
        order_id: paymentData.orderId,
        handler: async (response: any) => {
          try {
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyResult = await verifyResponse.json();

            if (verifyResult.success) {
              alert("✅ Payment Successful!");
              router.push(`/order/success?orderId=${verifyResult.data.orderId}`);
            } else {
              alert("Payment verification failed.");
              setProcessing(false);
            }
          } catch (error) {
            console.error("Verification error:", error);
            alert("Payment verification failed");
            setProcessing(false);
          }
        },
        prefill: {
          name: shippingAddress.name,
          contact: shippingAddress.phone,
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: () => {
            alert("Payment cancelled");
            setProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    };

    document.body.appendChild(script);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading checkout...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0FAF0]">
      {/* Header */}
      <div className="w-full bg-[#021B05] py-3 fixed top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="font-bold text-sm md:text-lg">ALCHER STORE</span>
          </div>
          <img 
            src="/images/auth/logo.svg" 
            alt="Alcheringa Logo" 
            className="object-contain h-8 md:h-10 lg:h-12 w-auto"
          />
          <div className="w-16 md:w-32"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 pt-24 max-w-6xl">
        {/* Tabs */}
        <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base md:text-lg font-semibold whitespace-nowrap">
            <span>Cart</span>
            <span className="text-xl sm:text-2xl">💎</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base md:text-lg font-semibold text-gray-600 whitespace-nowrap">
            <span>Delivery Address</span>
            <span className="text-xl sm:text-2xl">❤️</span>
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
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      placeholder="" 
                      value={shippingAddress.name.split(' ')[0] || shippingAddress.name} 
                      onChange={(e) => {
                        const lastName = shippingAddress.name.split(' ').slice(1).join(' ');
                        handleInputChange({
                          ...e,
                          target: { ...e.target, name: 'name', value: `${e.target.value} ${lastName}`.trim() }
                        } as any);
                      }}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input 
                      type="text" 
                      placeholder="" 
                      value={shippingAddress.name.split(' ').slice(1).join(' ')} 
                      onChange={(e) => {
                        const firstName = shippingAddress.name.split(' ')[0] || '';
                        handleInputChange({
                          target: { name: 'name', value: `${firstName} ${e.target.value}`.trim() }
                        } as any);
                      }}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone Number</label>
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
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
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
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
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
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input 
                        type="text"
                        placeholder="India"
                        defaultValue="India"
                        className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">State</label>
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
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">District</label>
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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">City</label>
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
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Pincode</label>
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

              {/* Mock Payment Toggle */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={mockMode} 
                    onChange={(e) => setMockMode(e.target.checked)} 
                    className="w-4 h-4" 
                  />
                  <span className="text-sm font-medium">Enable Mock Payment (Testing)</span>
                </label>
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
                <div className="border-t pt-4"></div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span className="font-medium">₹{shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST</span>
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
                {processing ? "Processing..." : "Next"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}