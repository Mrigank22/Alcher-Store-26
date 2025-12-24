"use client";

import { useState } from "react";

export default function AddToCartButton({
  productId,
  email,
}: {
  productId: string;
  email: string;
}) {
  const [loading, setLoading] = useState(false);

  async function addToCart() { 
    if (!email) {
      alert("Please login to add items to cart");
      return;
    }
    setLoading(true);

    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        product: productId,
        quantity: 1,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed");
    } else {
      alert("Added to cart");
    }

    setLoading(false);
  }

  return (
    <button
      onClick={addToCart}
      disabled={loading}
      className="mt-2 px-4 py-2 bg-black text-white rounded"
    >
      {loading ? "Adding..." : "Add to Cart"}
    </button>
  );
}
