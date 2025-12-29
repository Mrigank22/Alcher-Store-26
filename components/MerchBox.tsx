import ProductCard from "./ProductCard";
import Image from "next/image";

async function getProducts() {
  const res = await fetch("http://localhost:3000/api/admin/product", {
    cache: "no-store",
  });
  return res.json();
}

export default async function MerchBox() {
  const products = await getProducts();

  return (
    <section className="bg-[#F0FAF0] px-20 py-24 ">
      {/* TITLE */}
      {/* <h2 className="text-center text-4xl font-extrabold tracking-wider mb-20 text-[#05360B]">
        MERCHANDISE
      </h2> */}

      <div className="text-center text-4xl font-extrabold tracking-wider mb-20 text-green-950 leading-[48px]">
        MERCHANDISE
      </div>

      {/* PRODUCTS GRID */}
      <div
      className="grid 
                  grid-cols-1 
                  sm:grid-cols-2 
                  lg:grid-cols-3 
                  gap-10 
                  justify-items-center"
      >
        {products.slice(0, 3).map((product: any) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
