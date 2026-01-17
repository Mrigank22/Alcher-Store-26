"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import LoadingScreen from "./LoadingScreen";

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
};

type MerchBoxProps = {
  showHeading?: boolean;
};

export default function MerchBox({ showHeading = true }: MerchBoxProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Simulate progress during fetch
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 100);

        const res = await fetch("/api/admin/product?depth=1");
        const data = await res.json();

        clearInterval(progressInterval);
        setProgress(100);

        if (Array.isArray(data)) {
          setProducts(data);
        }

        // Small delay to show 100% before hiding
        setTimeout(() => {
          setLoading(false);
        }, 300);

      } catch (err) {
        console.error("Failed to fetch products", err);
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return <LoadingScreen progress={progress} />;
  }

  return (
      <section className="bg-[#F0FAF0] py-24 font-gotham">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-20">
          {showHeading && (
              <div className="text-center text-4xl font-extrabold mb-20 text-green-950">
                MERCHANDISE
              </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
            {products.slice(0, 3).map((product) => (
                <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        </div>
      </section>
  );
}