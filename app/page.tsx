"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Product {
  _id: string;
  product_id: string;
  name: string;
  img: string;
  price: number;
  size_boolean: boolean;
  stock: { size: string; quantity: number }[];
  stock_quantity: number;
}

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Fetch products from your existing product API
      const response = await fetch("/api/admin/product");
      const result = await response.json();
      
      // Handle both response formats
      if (result.success && result.data) {
        setProducts(result.data);
      } else if (result.value && Array.isArray(result.value)) {
        setProducts(result.value);
      } else if (Array.isArray(result)) {
        setProducts(result);
      } else {
        console.error("Unexpected response format:", result);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!session || !session.user?.email) {
      alert("Please login to add items to cart");
      router.push("/login");
      return;
    }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: session.user.email,
          product: productId, 
          quantity 
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("✅ Item added to cart!");
      } else {
        alert(result.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Alcheringa Store</h1>
          <div className="flex gap-4">
            {session ? (
              <>
                <button
                  onClick={() => router.push("/cart")}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  🛒 Cart
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Dashboard
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Products Grid */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6">Available Products</h2>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No products available</p>
            <p className="text-sm text-gray-500 mt-2">
              Add products from the admin panel
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img
                  src={product.img}
                  alt={product.name}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => router.push(`/product/${product._id}`)}
                />
                <div className="p-4">
                  <h3 
                    className="text-lg font-semibold mb-2 cursor-pointer hover:text-blue-600"
                    onClick={() => router.push(`/product/${product._id}`)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-2xl font-bold text-green-600 mb-2">
                    ₹{product.price}
                  </p>
                  
                  {/* Stock Info */}
                  {product.size_boolean ? (
                    <p className="text-sm text-gray-600 mb-3">
                      Available in {product.stock.length} sizes
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 mb-3">
                      {product.stock_quantity > 0 ? (
                        <span className="text-green-600">In Stock</span>
                      ) : (
                        <span className="text-red-600">Out of Stock</span>
                      )}
                    </p>
                  )}

                  {/* Add to Cart / View Options Button */}
                  <button
                    onClick={() => {
                      if (product.size_boolean) {
                        // For size variants, go to product page
                        router.push(`/product/${product._id}`);
                      } else {
                        // For regular products, add directly to cart
                        addToCart(product._id, 1);
                      }
                    }}
                    disabled={
                      !product.size_boolean && product.stock_quantity === 0
                    }
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {product.size_boolean
                      ? "View Options"
                      : product.stock_quantity > 0
                      ? "Add to Cart"
                      : "Out of Stock"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
