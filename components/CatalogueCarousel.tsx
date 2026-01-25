"use client";

import { useEffect, useState, useRef } from "react";
import ProductCard from "./ProductCard";
import Image from "next/image";

type MediaImage = {
  id: string;
  url: string;
  alt?: string;
};

export type Product = {
  product_id: string;
  name: string;
  price: number;
  images: MediaImage[];
  primaryImageIndex?: number;
  category?: { name: string; _id: string };
};

export default function CatalogueCarousel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Categories to exclude from this section
  const excludedCategories = ["Merch", "Combo"];

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/admin/product?depth=1");
        const data = await res.json();

        if (Array.isArray(data)) {
          // Filter out Merch and Combo products
          const catalogueProducts = data.filter(
            (product: Product) =>
              product.category?.name &&
              !excludedCategories.includes(product.category.name)
          );

          setProducts(catalogueProducts);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch products", err);
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading || products.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#F0FAF0] py-16 font-gotham">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-green-950">
            Here is our entire product catalogue
          </h2>
        </div>

        {/* Single Carousel with all products */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Scroll left"
          >
            <svg
              className="w-6 h-6 text-green-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Products Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-8 overflow-x-auto scroll-smooth no-scrollbar px-12"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product) => (
              <div
                key={product.product_id}
                className="flex-shrink-0 w-[300px] sm:w-[350px]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Scroll right"
          >
            <svg
              className="w-6 h-6 text-green-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
