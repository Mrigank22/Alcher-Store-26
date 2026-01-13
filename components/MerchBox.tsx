"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

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

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/admin/product?depth=1");
        const data = await res.json();

        if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="px-20 py-24 text-center text-xl">
        Loading merchandise...
      </section>
    );
  }

  return (
    <section className="bg-[#F0FAF0] px-20 py-24 font-gotham" >
      {showHeading && (
        <div className="text-center text-4xl font-extrabold tracking-wider mb-20 text-green-950 leading-[48px]">
          MERCHANDISE
        </div>
      )}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          gap-10
          justify-items-center
        "
      >
        {products.slice(0, 3).map((product) => (
          <ProductCard key={product.product_id} product={product} />
        ))}
      </div>
    </section>
  );
}
