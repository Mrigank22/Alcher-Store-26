"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

/* ================= TYPES ================= */

type Variant = {
  size?: string;
  color?: string;
  stock: number;
};

interface Product {
  _id: string;
  product_id: string;
  name: string;
  imageUrl: string;
  price: number;
  description?: string;
  hasSize: boolean;
  hasColor: boolean;
  variants: Variant[];
}

/* ================= PAGE ================= */

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();

  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);

  /* ================= FETCH PRODUCT ================= */

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  async function fetchProduct() {
    try {
      const res = await fetch(`/api/admin/product/${productId}`);
      if (!res.ok) throw new Error("Product not found");

      const data: Product = await res.json();
      setProduct(data);

      if (data.hasSize) {
        const firstAvailable = data.variants.find((v) => v.size && v.stock > 0);
        if (firstAvailable?.size) {
          setSelectedSize(firstAvailable.size);
        }
      }
    } catch (err) {
      console.error("Fetch product error:", err);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }

  /* ================= LOADING / NOT FOUND ================= */

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <button
          onClick={() => router.push("/")}
          className="bg-blue-500 text-white px-6 py-2 rounded"
        >
          Back to Products
        </button>
      </div>
    );
  }

  /* =======================================================
     ✅ CRITICAL FIX — NON-NULL ALIAS (removes TS errors)
     ======================================================= */
  const p = product;

  /* ================= STOCK LOGIC ================= */

  const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);

  const selectedSizeStock = p.hasSize
    ? p.variants.find((v) => v.size === selectedSize)?.stock ?? 0
    : totalStock;

  const isOutOfStock =
    totalStock === 0 || (p.hasSize && p.variants.every((v) => v.stock === 0));

  /* ================= ADD TO CART ================= */

  async function addToCart() {
    if (!session?.user?.email) {
      alert("Please login to add items to cart");
      router.push("/login");
      return;
    }

    if (p.hasSize && !selectedSize) {
      alert("Please select a size");
      return;
    }

    setAdding(true);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          product: p.product_id,
          quantity,
          size: selectedSize || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to add to cart");
      } else {
        alert("✅ Item added to cart!");
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  }

  /* ================= BUY NOW ================= */

  async function handleBuyNow() {
    if (!session?.user?.email) {
      alert("Please login to buy items");
      router.push("/login");
      return;
    }

    if (p.hasSize && !selectedSize) {
      alert("Please select a size first");
      return;
    }

    setBuying(true);

    try {
      const res = await fetch("/api/temp-order-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: p.product_id,
          quantity,
          size: selectedSize || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      router.push("/checkout?type=direct");
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setBuying(false);
    }
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between">
          <button onClick={() => router.push("/")} className="text-blue-500">
            ← Back
          </button>
          {session && (
            <button
              onClick={() => router.push("/cart")}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              🛒 Cart
            </button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          <img
            src={p.imageUrl}
            alt={p.name}
            className="w-full h-96 object-cover rounded-l-lg"
          />

          <div className="p-6">
            <h1 className="text-3xl font-bold mb-2">{p.name}</h1>
            <p className="text-3xl font-bold text-green-600 mb-4">₹{p.price}</p>
            {p.description && (
              <p className="text-gray-600 mb-4">{p.description}</p>
            )}

            {p.hasSize && (
              <div className="mb-4">
                <p className="font-semibold mb-2">Select Size:</p>
                <div className="flex gap-2 flex-wrap">
                  {p.variants.map(
                    (v) =>
                      v.size && (
                        <button
                          key={v.size}
                          disabled={v.stock === 0}
                          onClick={() => setSelectedSize(v.size!)}
                          className={`px-4 py-2 border rounded ${
                            selectedSize === v.size
                              ? "bg-blue-500 text-white"
                              : "bg-white"
                          } ${
                            v.stock === 0 && "opacity-40 cursor-not-allowed"
                          }`}
                        >
                          {v.size}
                        </button>
                      )
                  )}
                </div>
              </div>
            )}

            <div className="mb-4 flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                −
              </button>
              <span className="text-lg">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity(Math.min(selectedSizeStock, quantity + 1))
                }
                className="px-3 py-1 bg-gray-200 rounded"
              >
                +
              </button>
            </div>

            <div className="flex gap-4">
              <button
                onClick={addToCart}
                disabled={adding || isOutOfStock}
                className="flex-1 bg-green-600 text-white py-3 rounded"
              >
                {adding ? "Adding..." : "Add to Cart"}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={buying || isOutOfStock}
                className="flex-1 bg-orange-600 text-white py-3 rounded"
              >
                {buying ? "Processing..." : "⚡ Buy Now"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
