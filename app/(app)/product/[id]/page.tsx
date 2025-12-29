"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import JokerNew from "@/components/JokerNew";
import StarReviewCard from "@/components/reviews/StarReviewCard";
import ImageReviewCard from "@/components/reviews/ImageReviewCard";
import Navbar from "@/components/Navbar";

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

type Review = {
  _id: string;
  userName: string;
  content: string;
  rating: number;
  createdAt: string;
};

/* ================= PAGE ================= */

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();

  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);

  /* ================= FETCH PRODUCT ================= */

  useEffect(() => {
    fetchProduct();
    fetchReviews();
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

  /* ================= FETCH REVIEWS ================= */

  async function fetchReviews() {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Review fetch error:", err);
      setReviews([]);
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

  /* ================= SAFE ALIAS ================= */

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
          product: p._id,
          quantity,
          size: selectedSize || undefined,
          colour: null,
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


  return (
    <>
    <Navbar/>
  <div className="pt-3 min-h-screen bg-[#F2FAF2]">
    {/* MAIN PRODUCTSECTION */}
    <div className="max-w-6xl mx-auto px-4 md:px-6 md:py-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">

      {/* IMAGE SECTION */}
      <div className="relative flex justify-center">
        <div className="w-full max-w-md border-2 border-[#05360B] rounded-sm p-2">
          <img
            src={p.imageUrl}
            alt={p.name}
            className="w-full h-[380px] md:h-[550px] object-cover bg-gray-200 border-[1.5px] border-[#05360B]"
          />
        </div>

        <button className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 border-2 border-black px-2 py-8">
          <Image src="/left-arrow.png" alt="left-arrow" width={12} height={10}/>
        </button>
        <button className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 border-2 border-black px-2 py-8">
          <Image src="/right-arrow.png" alt="right-arrow" width={12} height={10}/>
        </button>
      </div>
      <div className="flex justify-center gap-2 mt-3 md:hidden">
  <span className="w-2 h-2 rounded-full bg-[#021B05]" />
  <span className="w-2 h-2 rounded-full bg-[#A7C5AA]" />
  <span className="w-2 h-2 rounded-full bg-[#A7C5AA]" />
  <span className="w-2 h-2 rounded-full bg-[#A7C5AA]" />
</div>

      {/* PRODUCT DETAILS */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-[28px] md:text-[40px] font-medium mb-1">{p.name}</h1>
          <p className=" text-xs md:text-sm font-semibold text-[#5E5E5E]">Regular Fit T-Shirt</p>
        </div>

        {p.description && (
          <p className="text-sm font-semibold leading-relaxed text-black max-w-full md:max-w-md">
            {/* {p.description} */}
            Excepteur ut qui esse labore cupidatat officia quis veniam occaecat pariatur velit excepteur ex Lorem. Sint qui minim amet non esse culpa anim. Elit laborum veniam aliquip exercitation anim laborum consectetur irure cupidatat aliquip ipsum consectetur anim ad cupidatat. Nisi occaecat nulla incididunt proident cupidatat enim anim eiusmod amet duis minim laboris.
          </p>
        )}

        {/* COLOURS (UI only) */}
        {/* <div>
          <p className="text-xs font-semibold mb-2">COLOURS</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full bg-gray-300"
              />
            ))}
          </div>
        </div> */}

        {/* SIZE */}
        {p.hasSize && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <p className="text-base font-bold">SIZE</p>
              <span className="text-sm text-[#188123] font-medium underline cursor-pointer">
                SIZE CHART
              </span>
            </div>

            <div className="flex gap-4 flex-wrap">
              {p.variants.map(
                (v) =>
                  v.size && (
                    <button
                      key={v.size}
                      disabled={v.stock === 0}
                      onClick={() => setSelectedSize(v.size!)}
                      className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full text-sm md:text-base border transition font-medium
                        ${
                          selectedSize === v.size
                            ? "bg-[#1F7A1F] text-white"
                            : "bg-[#D1E9D4] text-[#5E5E5E]"
                        }
                        ${v.stock === 0 && "opacity-40 cursor-not-allowed"}
                      `}
                    >
                      {v.size}
                    </button>
                  )
              )}
            </div>
          </div>
        )}

        {/* QUANTITY */}
        <div>
          <p className="text-base font-bold mb-2">QUANTITY</p>
          <div className="flex items-center justify-between gap-4 border border-black rounded-full w-[140px] h-[45px] px-1 mx-auto md:mx-0">
            <button  className="
      w-9 h-9
      rounded-full
      bg-[#D1E9D4]
      text-black
      flex items-center justify-center
      text-[24px]
      font-semibold
      leading-none
      disabled:opacity-50
    " onClick={() => setQuantity(Math.max(1, quantity - 1)) }>
              -
            </button>
            <span className="font-semibold text-base ">{quantity}</span>
            <button
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
              onClick={() =>
                setQuantity(Math.min(selectedSizeStock, quantity + 1))
              }
            >
              +
            </button>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col md:flex-row gap-3 mt-4">
          <button
            onClick={addToCart}
            disabled={adding || isOutOfStock}
            className="px-10 py-3 rounded-full bg-[#1B9328] text-[#F0FAF0] font-bold md:w-[250px]"
          >
            {adding ? "Adding..." : "Add to Cart"}
          </button>

          <button
            onClick={handleBuyNow}
            disabled={buying || isOutOfStock}
            className="px-10 py-3 rounded-full bg-[#D1E9D4] text-black font-medium md:w-[250px]"
          >
            {buying ? "Processing..." : "Buy Now"}
          </button>
        </div>
      </div>
    </div>
  </div>

  {/* something new part */}

  <JokerNew/>

  <section className="bg-[#F0FAF0] pt-8 min-h-screen">
  {/* Heading */}
  <div className="max-w-6xl mx-auto px-6 text-center">
    <h2 className="text-[24px] md:text-[48px] font-medium text-[#05360B] tracking-wide">
      CHECK OUT OUR OTHER PRODUCTS
    </h2>
  </div>
</section>

<section className="relative min-h-screen bg-[#021B02] pt-20">

  <div className="hidden md:flex md:absolute md:inset-0 md:pointer-events-none md:z-0">
    <img src="/image518.png" alt="" 
    className="absolute
    top-[100px]
    left-[920px]"/>
    <img src="/image519.png" alt="" 
    className="absolute
    top-[250px]
    left-[705px]"/>
     <img src="/image520.png" alt="" 
    className="absolute
    top-[150px]
    left-[-40px]"/>
    <img src="/image521.png" alt="" 
    className="absolute
    top-[250px]
    left-[-40px]"/>
  </div>


  <h2 className="text-center text-5xl font-bold text-white mb-12">
    REVIEWS
  </h2>
  {reviews.length === 0 ? (
    <p className="text-center text-gray-300">No reviews yet.</p>
  ) : (
<div className="flex
    gap-6
    overflow-x-auto
    px-6
    snap-x snap-mandatory
    scroll-smooth

    md:justify-center
    md:flex-wrap
    md:overflow-visible">
  {reviews.slice(0,4).map((review, index) =>
    index % 2 === 0 ? (
      <StarReviewCard key={review._id} review={review} />
    ) : (
      <ImageReviewCard key={review._id} review={review} />
    )
  )}
</div>
  )}
</section>
</>
);

}
