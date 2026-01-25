"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import LoadingScreen from "./LoadingScreen";
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
  category?: { name: string };
};

export default function ComboSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCombos() {
      try {
        const res = await fetch("/api/admin/product?depth=1");
        const data = await res.json();

        if (Array.isArray(data)) {
          // Filter only combo products
          const combos = data.filter(
            (p: Product) => p.category?.name === "Combo"
          );
          setProducts(combos);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch combos", err);
        setLoading(false);
      }
    }

    fetchCombos();
  }, []);

  if (loading) {
    return <LoadingScreen progress={50} />;
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#F0FAF0] py-16 font-gotham">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-20">
        {/* Header with Zenith logo */}
        <div className="text-center mb-8">
          <p className="text-sm text-gray-600 uppercase tracking-wider mb-2">
            IN ASSOCIATION WITH
          </p>
          <div className="flex justify-center mb-6">
            <Image
              src="/zenith-logo.png"
              alt="Zenith Saba Store"
              width={150}
              height={60}
              className="object-contain"
            />
          </div>
          <h2 className="text-4xl font-extrabold text-green-950 uppercase">
            Alcheringa Official Accessories
          </h2>
          <p className="text-lg text-gray-700 mt-4">
            Check out our Limited Edition Combos
          </p>
        </div>

        {/* Combo Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center mt-12">
          {products.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
