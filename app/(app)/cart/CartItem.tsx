"use client";

import { useState } from "react";
import Image from "next/image"

export default function CartItem({
  item,
  email,
}: {
  item: any;
  email: string;
}) {
  const [loading, setLoading] = useState(false);

  async function updateQuantity(newQty: number) {
  try {
    if (newQty < 1) {
      await removeItem();
      return;
    }

    const payload: any = {
      email,
      product: item.product._id,
      quantity: newQty,
    };

    if (item.size) payload.size = item.size;
    if (item.colour) payload.colour = item.colour;

    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    window.location.reload();
  } finally {
    setLoading(false);
  }
  }

  async function removeItem() {
  try {
    const payload: any = {
      email,
      product: item.product._id,
    };

    if (item.size) payload.size = item.size;
    if (item.colour) payload.colour = item.colour;

    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    window.location.reload();
  } finally {
    setLoading(false);
  }
  }

  return (
    <div className="relative flex flex-col md:flex-row md:items-center gap-3 md:gap-4 bg-white border border-black rounded-xl p-4 shadow-[4px_5px_4px_0px_rgba(0,0,0,0.25)]">
      <img
  src={item.product.imageUrl || item.product.img}
  className="w-[120px] h-[130px] object-cover rounded"
/>

      {/* Details */}
      <div className="flex-1">
        <p className="font-medium md:text-[24px] text-20px">{item.product.name}</p>
        {/* <p className="text-sm text-gray-500">T Shirt</p> */}

        {item.size && (
          <p className="text-sm font-medium mt-1 text-[#5E5E5E]">
            Size:{" "}
            <span className="font-medium text-[#5E5E5E]">
              {item.size}
            </span>{" "}
            <span className="ml-4 font-medium text-[#188123] cursor-pointer underline">
              CHOOSE SIZE
            </span>
          </p>
        )}
<div className="mt-3 md:mt-6 flex items-center justify-between w-[110px] md:w-[140px] h-[40px] md:h-[50px] px-1
    border border-black
    rounded-full
    bg-white">


  <button
    disabled={loading}
    onClick={() => updateQuantity(item.quantity - 1)}
    className="
      w-9 h-9
      rounded-full
      bg-[#D1E9D4]
      text-black
      flex items-center justify-center
      text-[24px]
      font-semibold
      leading-none
      disabled:opacity-50
    "
  >
    -
  </button>

  <span className="text-base font-medium select-none">
    {item.quantity}
  </span>

  <button
    disabled={loading}
    onClick={() => updateQuantity(item.quantity + 1)}
    className="
      w-9 h-9
      rounded-full
      bg-[#D1E9D4]
      text-black
      flex items-center justify-center
       text-[24px]
      font-semibold
      leading-none
      disabled:opacity-50
    "
  >
    +
  </button>
</div>

      </div>

      {/* Price + Remove */}
        <div className="text-right md:text-right">
  <p className="font-medium text-xl md:text-2xl text-black">
    ₹{item.price}
  </p>
        <button
  onClick={async () => {
    const ok = confirm("Remove this item from cart?");
    if (!ok) return;
    await removeItem();
  }}
  className="
    flex items-center gap-1
    text-[#9F1E17] font-semibold
    md:border rounded-full
    bg-white
    md:bg-[#33333333]

    /* MOBILE */
    absolute top-2 right-2 p-2 text-xs

    /* DESKTOP */
    md:static md:mt-4 md:py-2 md:px-4 md:text-sm
  "
>
  {/* MOBILE: X */}
  <span className="md:hidden text-sm font-bold leading-none">✕</span>

  {/* DESKTOP: Trash + text */}
  <span className="hidden md:flex items-center gap-1">
    <Image
      src="/Trash.png"
      alt="remove"
      width={16}
      height={16}
    />
    Remove
  </span>
</button>
      </div>
    </div>
  );
}

