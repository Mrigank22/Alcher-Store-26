"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    img: string;
    price: number;
  };
  quantity: number;
  size: string | null;
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

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [mockMode, setMockMode] = useState(false); // Toggle for testing

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

  // Fetch cart items
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

      const response = await fetch(`/api/cart?email=${session.user.email}`);
      const result = await response.json();

      if (result && result.items && result.items.length > 0) {
        setCartItems(result.items);
        calculateTotals(result.items);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      alert("Failed to load cart");
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
    const taxAmount = Math.round(sub * 0.18); // 18% GST
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
      alert("Your cart is empty. Please add items before checkout.");
      router.push("/");
      return;
    }

    setProcessing(true);

    try {
      // Step 1: Create order
      const orderResponse = await fetch("/api/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingAddress }),
      });

      const orderResult = await orderResponse.json();

      if (!orderResult.success) {
        alert(orderResult.message || "Failed to create order");
        setProcessing(false);
        return;
      }

      const { orderId, totalAmount } = orderResult.data;

      // Step 2: Create payment
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

      // Step 3: Handle payment (Mock or Real)
      if (mockMode || paymentResult.mockMode) {
        // Mock payment - simulate success
        handleMockPayment(paymentResult.data, orderId);
      } else {
        // Real Razorpay payment
        handleRazorpayPayment(paymentResult.data, orderId);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred during checkout");
      setProcessing(false);
    }
  };

  const handleMockPayment = async (paymentData: any, orderId: string) => {
    // Simulate payment process
    setTimeout(async () => {
      try {
        // Verify mock payment
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
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onerror = () => {
      alert("Failed to load Razorpay. Please check your internet connection.");
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
          // Payment successful, verify on server
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
              router.push(
                `/order/success?orderId=${verifyResult.data.orderId}`
              );
            } else {
              alert("Payment verification failed. Please contact support.");
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

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p>Your cart is empty. Add items before checkout.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Shipping Form */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name *"
              value={shippingAddress.name}
              onChange={handleInputChange}
              className="w-full border px-4 py-2 rounded"
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number *"
              value={shippingAddress.phone}
              onChange={handleInputChange}
              className="w-full border px-4 py-2 rounded"
              required
            />
            <input
              type="text"
              name="addressLine1"
              placeholder="Address Line 1 *"
              value={shippingAddress.addressLine1}
              onChange={handleInputChange}
              className="w-full border px-4 py-2 rounded"
              required
            />
            <input
              type="text"
              name="addressLine2"
              placeholder="Address Line 2 (Optional)"
              value={shippingAddress.addressLine2}
              onChange={handleInputChange}
              className="w-full border px-4 py-2 rounded"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="city"
                placeholder="City *"
                value={shippingAddress.city}
                onChange={handleInputChange}
                className="w-full border px-4 py-2 rounded"
                required
              />
              <input
                type="text"
                name="state"
                placeholder="State *"
                value={shippingAddress.state}
                onChange={handleInputChange}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>
            <input
              type="text"
              name="pincode"
              placeholder="Pincode *"
              value={shippingAddress.pincode}
              onChange={handleInputChange}
              className="w-full border px-4 py-2 rounded"
              required
            />
          </div>

          {/* Mock Mode Toggle */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={mockMode}
                onChange={(e) => setMockMode(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">
                Enable Mock Payment Mode (Testing)
              </span>
            </label>
            <p className="text-xs text-gray-600 mt-1">
              Use this for testing without real payments
            </p>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="border rounded p-4 space-y-4">
            {/* Cart Items */}
            {cartItems.map((item) => (
              <div key={item._id} className="flex gap-4 border-b pb-4">
                <img
                  src={item.product.img}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.product.name}</h3>
                  {item.size && (
                    <p className="text-sm text-gray-600">Size: {item.size}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    Qty: {item.quantity} × ₹{item.price}
                  </p>
                  <p className="font-semibold">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              </div>
            ))}

            {/* Totals */}
            <div className="space-y-2 pt-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{shippingCost === 0 ? "FREE" : `₹${shippingCost}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (18% GST):</span>
                <span>₹{tax}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-2">
                <span>Total:</span>
                <span>₹{total}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={processing}
              className="w-full bg-green-600 text-white py-3 rounded font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed mt-4"
            >
              {processing ? "Processing..." : "Proceed to Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
