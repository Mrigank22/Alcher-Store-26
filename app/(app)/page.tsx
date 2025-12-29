"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AddProduct from "@/components/AddProduct";

/* ================= TYPES ================= */

type Variant = {
  size?: string;
  color?: string;
  stock: number;
};

interface Product {
  _id: string; // Mongo internal
  product_id: string;
  name: string;
  imageUrl: string;
  price: number;
  hasSize: boolean;
  hasColor: boolean;
  variants: Variant[];
}

/* ================= PAGE ================= */

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);


  /* ================= FETCH ================= */

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch("/api/admin/product");
      const data = await res.json();

      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data?.data && Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Fetch products error:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  /* ================= ADD TO CART ================= */

  async function addToCart(product: Product) {
    if (!session?.user?.email) {
      alert("Please login first");
      router.push("/login");
      return;
    }

    const variantIndex = product.variants.findIndex((v) => v.stock > 0);
    if (variantIndex === -1) {
      alert("Out of stock");
      return;
    }

    const variant = product.variants[variantIndex];

    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: session.user.email,
        product: product._id,
        size: variant.size || null,
        colour: variant.color || null,
        quantity: 1,
      }),
    });

    alert("✅ Added to cart");
  }

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between">
          <h1 className="text-3xl font-bold">Alcheringa Store</h1>

          <div className="flex gap-4">
            {session ? (
              <>
                <button
                  onClick={() => router.push("/cart")}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  🛒 Cart
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Dashboard
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ADMIN ADD PRODUCT */}
        <section className="container mx-auto px-4 py-8">
          <AddProduct />
        </section>

      {/* PRODUCT LIST */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6">Available Products</h2>

        {products.length === 0 ? (
          <p className="text-center text-gray-600">No products available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const totalStock = product.variants.reduce(
                (sum, v) => sum + v.stock,
                0
              );

              const hasVariants = product.variants.length > 1;

              return (
                <div
                  key={product.product_id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() =>
                      router.push(`/product/${product.product_id}`)
                    }
                  />

                  <div className="p-4">
                    <h3
                      className="text-lg font-semibold cursor-pointer"
                      onClick={() =>
                        router.push(`/product/${product.product_id}`)
                      }
                    >
                      {product.name}
                    </h3>

                    <p className="text-xl font-bold text-green-600">
                      ₹{product.price}
                    </p>

                    <p className="text-sm mb-3">
                      {totalStock > 0 ? (
                        <span className="text-green-600">In Stock</span>
                      ) : (
                        <span className="text-red-600">Out of Stock</span>
                      )}
                    </p>

                    {/* <button
                      disabled={totalStock === 0}
                      onClick={() =>
                        hasVariants
                          ? router.push(`/product/${product.product_id}`)
                          : addToCart(product)
                      }
                      className="w-full bg-blue-500 text-white py-2 rounded disabled:bg-gray-300"
                    >
                      {hasVariants ? "View Options" : "Add to Cart"}
                    </button> */}

                    <button
  disabled={totalStock === 0}
  onClick={() =>
    router.push(`/product/${product.product_id}`)
  }
  className="w-full bg-blue-500 text-white py-2 rounded disabled:bg-gray-300"
>
  {hasVariants ? "View Options" : "View"}
</button>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
