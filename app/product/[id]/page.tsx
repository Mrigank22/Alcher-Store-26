"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
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
  description?: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await fetch("/api/admin/product");
      const result = await response.json();

      let products = [];
      if (result.success && result.data) {
        products = result.data;
      } else if (result.value && Array.isArray(result.value)) {
        products = result.value;
      } else if (Array.isArray(result)) {
        products = result;
      }

      const foundProduct = products.find((p: Product) => p._id === productId);
      
      if (foundProduct) {
        setProduct(foundProduct);
        // Set default size if product has sizes
        if (foundProduct.size_boolean && foundProduct.stock.length > 0) {
          setSelectedSize(foundProduct.stock[0].size);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!session || !session.user?.email) {
      alert("Please login to add items to cart");
      router.push("/login");
      return;
    }

    if (product?.size_boolean && !selectedSize) {
      alert("Please select a size");
      return;
    }

    setAdding(true);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          product: productId,
          quantity,
          size: selectedSize || undefined,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("✅ Item added to cart!");
        router.push("/cart");
      } else {
        alert(result.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

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
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Back to Products
        </button>
      </div>
    );
  }

  const isOutOfStock = !product.size_boolean && product.stock_quantity === 0;
  const selectedSizeStock = product.size_boolean 
    ? product.stock.find(s => s.size === selectedSize)?.quantity || 0
    : product.stock_quantity;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push("/")}
            className="text-blue-500 hover:text-blue-700"
          >
            ← Back to Products
          </button>
          {session && (
            <button
              onClick={() => router.push("/cart")}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              🛒 Cart
            </button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Image */}
            <div className="p-6">
              <img
                src={product.img}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>

            {/* Product Details */}
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              
              <p className="text-3xl font-bold text-green-600 mb-6">
                ₹{product.price}
              </p>

              {product.description && (
                <p className="text-gray-600 mb-6">{product.description}</p>
              )}

              {/* Stock Status */}
              <div className="mb-6">
                {product.size_boolean ? (
                  <p className="text-sm text-gray-600">
                    Available in {product.stock.length} sizes
                  </p>
                ) : (
                  <p className={`text-sm font-semibold ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                    {isOutOfStock ? 'Out of Stock' : `${product.stock_quantity} in stock`}
                  </p>
                )}
              </div>

              {/* Out of Stock Message */}
              {(isOutOfStock || (product.size_boolean && product.stock.every(s => s.quantity === 0))) ? (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800 font-semibold">
                    🔔 Available Soon
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    This product is currently out of stock. Check back later!
                  </p>
                </div>
              ) : (
                <>
                  {/* Size Selection */}
                  {product.size_boolean && (
                    <div className="mb-6">
                      <label className="block text-sm font-semibold mb-2">
                        Select Size:
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {product.stock.map((stockItem) => (
                          <button
                            key={stockItem.size}
                            onClick={() => setSelectedSize(stockItem.size)}
                            disabled={stockItem.quantity === 0}
                            className={`px-4 py-2 border rounded ${
                              selectedSize === stockItem.size
                                ? 'bg-blue-500 text-white border-blue-500'
                                : stockItem.quantity === 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-white hover:border-blue-500'
                            }`}
                          >
                            {stockItem.size}
                            {stockItem.quantity === 0 && (
                              <span className="block text-xs">Out of Stock</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2">
                      Quantity:
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                        disabled={quantity <= 1}
                      >
                        −
                      </button>
                      <span className="text-xl font-semibold w-12 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(selectedSizeStock, quantity + 1))}
                        className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                        disabled={quantity >= selectedSizeStock}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={addToCart}
                    disabled={adding || isOutOfStock || selectedSizeStock === 0}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {adding
                      ? "Adding..."
                      : isOutOfStock || selectedSizeStock === 0
                      ? "Out of Stock"
                      : "Add to Cart"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}