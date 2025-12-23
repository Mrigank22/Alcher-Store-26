"use client";

import { useState } from "react";

export default function CartItem({
  item,
  email,
}: {
  item: any;
  email: string;
}) {
  const [loading, setLoading] = useState(false);

  async function updateQuantity(newQty: number) {
    setLoading(true);

    if (newQty < 1) {
      await removeItem();
      return;
    }

    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        product: item.product._id,
        size: item.size,
        colour: item.colour,
        quantity: newQty,
      }),
    });

    window.location.reload();
  }

  async function removeItem() {
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        product: item.product._id,
      }),
    });

    window.location.reload();
  }

  return (
    <div className="flex items-center gap-4 border rounded p-4">
      <img
        src={item.product.img}
        className="w-20 h-20 object-cover rounded"
      />

      <div className="flex-1">
        <p className="font-semibold">{item.product.name}</p>
        <p>₹{item.price}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          disabled={loading}
          onClick={() => updateQuantity(item.quantity - 1)}
        >
          −
        </button>
        <span>{item.quantity}</span>
        <button
          disabled={loading}
          onClick={() => updateQuantity(item.quantity + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
