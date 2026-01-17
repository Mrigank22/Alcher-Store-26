"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import JokerNew from "@/components/JokerNew";
import StarReviewCard from "@/components/reviews/StarReviewCard";
import ImageReviewCard from "@/components/reviews/ImageReviewCard";
import Navbar from "@/components/Navbar";
import MerchBox from "@/components/MerchBox"
import LoadingScreen from "@/components/LoadingScreen";

/* ================= TYPES ================= */

type Variant = {
  size?: string;
  color?: string;
  stock: number;
};

type MediaImage = {
  id: string;
  url: string;
  alt?: string;
};

interface Product {
  _id: string;
  product_id: string;
  name: string;
  images: MediaImage[];
  primaryImageIndex?: number;
  price: number;
  description?: string;
  hasSize: boolean;
  hasColor: boolean;
  variants: Variant[];
  productType?: string;
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
  const [progress, setProgress] = useState(0);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Touch swipe state
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  /* ================= FETCH PRODUCT ================= */

  const fetchProduct = async () => {
    try {
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const res = await fetch(`/api/admin/product/${productId}?depth=1`);
      if (!res.ok) throw new Error("Product not found");

      const data: Product = await res.json();

      // Clear interval and set to 100%
      clearInterval(progressInterval);
      setProgress(100);

      setProduct(data);

      if (data.hasSize) {
        const firstAvailable = data.variants.find((v) => v.size && v.stock > 0);
        if (firstAvailable?.size) {
          setSelectedSize(firstAvailable.size);
        }
      }

      // Small delay to show 100% before hiding
      setTimeout(() => {
        setLoading(false);
      }, 300);

    } catch (err) {
      console.error("Fetch product error:", err);
      setProduct(null);
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Review fetch error:", err);
      setReviews([]);
    }
  };

  useEffect(() => {
    void fetchProduct();
    void fetchReviews();
  }, [productId]);

  useEffect(() => {
    if (product?.images?.length) {
      setActiveImage(product.primaryImageIndex ?? 0);
    }
  }, [product]);

  /* ================= TOUCH SWIPE HANDLERS ================= */

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0) {
      // Swipe left - next image
      setActiveImage((prev) =>
          prev === (product?.images.length || 1) - 1 ? 0 : prev + 1
      );
    } else {
      // Swipe right - previous image
      setActiveImage((prev) =>
          prev === 0 ? (product?.images.length || 1) - 1 : prev - 1
      );
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  /* ================= LOADING / NOT FOUND ================= */

  if (loading) {
    return <LoadingScreen progress={progress} />;
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

  /* ================= SIZE CHART MAPPING ================= */

  const getSizeChartImage = (productId: string): string | null => {
    const sizeChartMap: Record<string, string> = {
      'ALCH001': '/shirt_chart.jpeg',
      'ALCH002': '/over_chart.jpeg',
      'ALCH003': '/hoodie_chart.jpeg',
    };
    return sizeChartMap[productId] || null;
  };

  const sizeChartImage = getSizeChartImage(p.product_id);

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
          <div className="max-w-6xl mx-auto px-4 md:px-6 md:py-12 grid grid-cols-1 md:grid-cols-2 md:gap-8 lg:gap-14">

            {/* IMAGE SECTION */}
            <div className="relative flex flex-col items-center ">
              <div
                  className="w-full max-w-md border-2 border-[#05360B] rounded-sm p-2"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
              >
                <img
                    src={p.images[activeImage]?.url ||
                        p.images?.[0]?.url ||
                        "/placeholder.png"
                    }
                    alt={p.name}
                    className="w-full h-[380px] md:h-[550px] object-cover bg-gray-200 border-[1.5px] border-[#05360B]"
                />
              </div>

              <div className="flex justify-center gap-2 mt-3 lg:hidden">
                {p.images.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`w-2 h-2 rounded-full transition ${
                            activeImage === idx ? "bg-[#021B05]" : "bg-[#A7C5AA]"
                        }`}
                    />
                ))}
              </div>

              <button
                  onClick={() =>
                      setActiveImage((prev) =>
                          prev === 0 ? p.images.length - 1 : prev - 1
                      )
                  }
                  className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 border-2 border-black px-2 py-8"
              >
                <Image src="/left-arrow.png" alt="left-arrow" width={12} height={10} />
              </button>

              <button
                  onClick={() =>
                      setActiveImage((prev) =>
                          prev === p.images.length - 1 ? 0 : prev + 1
                      )
                  }
                  className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 border-2 border-black px-2 py-8"
              >
                <Image src="/right-arrow.png" alt="right-arrow" width={12} height={10} />
              </button>

            </div>

            {/* PRODUCT DETAILS */}
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-[28px] md:text-[40px] font-medium mb-1">{p.name}</h1>
                <p className=" text-xs md:text-sm font-semibold text-[#5E5E5E]">{p.productType || "Regular Fit T-Shirt"}</p>
              </div>

              {p.description && (
                  <p className="text-sm font-semibold leading-relaxed text-black max-w-full md:max-w-md">
                    {p.description}
                  </p>
              )}

              {/* SIZE */}
              {p.hasSize && (
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-base font-bold">SIZE</p>
                      {sizeChartImage && (
                          <button
                              onClick={() => setShowSizeChart(true)}
                              className="text-sm text-[#188123] font-medium underline cursor-pointer hover:text-[#126d1a] transition"
                          >
                            SIZE CHART
                          </button>
                      )}
                    </div>

                    <div className="flex gap-4 flex-wrap">
                      {p.variants
                          .filter((v) => v.size && v.stock > 0)
                          .map((v) => (
                              <button
                                  key={v.size}
                                  onClick={() => setSelectedSize(v.size!)}
                                  className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full text-sm md:text-base border transition font-medium
                        ${
                                      selectedSize === v.size
                                          ? "bg-[#1F7A1F] text-white"
                                          : "bg-[#D1E9D4] text-[#5E5E5E]"
                                  }
                      `}
                              >
                                {v.size}
                              </button>
                          ))
                      }
                    </div>
                  </div>
              )}

              {/* QUANTITY */}
              <div>
                <p className="text-base font-bold mb-2">QUANTITY</p>
                <div className="flex items-center justify-between gap-4 border border-black rounded-full w-[160px] sm:w-[140px] h-[45px] px-1 md:mx-0">
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

        <section className="bg-[#F0FAF0] py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-[#021B05] text-[#F0FAF0] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <img src="/calendar-pre-order.png" alt="" />
                  <h3 className="text-2xl font-medium">Pre-Order your merch</h3>
                </div>

                <p className="text-sm leading-relaxed opacity-90 mb-4">
                  We are currently accepting pre-orders. When you place your order in advance,
                  it helps us plan our production better. This allows us to prepare your product
                  with care and deliver it to you on time.
                </p>

                <ul className="text-sm leading-relaxed opacity-90 list-disc list-inside space-y-2">
                  <li>All pre-orders require full payment at the time of purchase</li>
                  <li>Your order will be confirmed and scheduled for dispatch on 24 January 2026</li>
                  <li>Pre-orders cannot be cancelled once placed</li>
                </ul>
              </div>
              <div className="bg-[#021B05] text-[#F0FAF0] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <img src="/hand-delivery-box.png" alt="" />
                  <h3 className="text-2xl font-medium">Return Policy</h3>
                </div>

                <ul className="text-sm leading-relaxed opacity-90 list-disc list-inside space-y-3">
                  <li>
                    We do not accept returns, as our products are not mass-produced and are made to order.
                  </li>
                  <li>
                    Refunds are only provided if the product delivered is damaged or incorrect,
                    and valid evidence is provided. Replacements are not offered.
                  </li>
                  <li>
                    Returns are not allowed for wrong size selection. Please check the size chart carefully.
                  </li>
                  <li>
                    Returns or refunds are not applicable for cases of dislike, design preference,
                    or unmet expectations.
                  </li>
                </ul>
              </div>

              <div className="bg-[#021B05] text-[#F0FAF0] rounded-2xl p-6 md:p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <img src="/costumer-service.png" alt="" />
                  <h3 className="text-2xl font-medium">Call & Email Support</h3>
                </div>

                {/* Description */}
                <p className="text-sm leading-relaxed opacity-90 mb-6">
                  We're happy to help you with any questions about your order or our products.
                  You can reach us through call or email, and we'll do our best to respond as
                  soon as possible.
                </p>

                {/* Reach out */}
                <p className="text-sm font-medium mb-3">Reach Out to Us :</p>

                {/* Contact list */}
                <ul className="text-sm space-y-4 opacity-90">
                  <li className="flex flex-col">
                    <span className="font-medium">Ayush Bahuguna</span>
                    <span className="block">+91 7060633995</span>
                    <span className="block">creatives@alcheringa.co.in</span>
                  </li>

                  <li className="flex flex-col">
                    <span className="font-medium">Ayush Bahuguna</span>
                    <span className="block">+91 7060633995</span>
                    <span className="block">creatives@alcheringa.co.in</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* something new part */}

        <JokerNew/>

        <section className="bg-[#F0FAF0] pt-8 min-h-screen">
          {/* Heading */}
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-[24px] md:text-[48px] font-medium text-[#05360B] tracking-wide">
              CHECK OUT OUR OTHER PRODUCTS
            </h2>
            <MerchBox showHeading={false}/>
          </div>
        </section>

        <section className="relative min-h-screen bg-[#021B02] pt-20 overflow-x-hidden">

          <div className="hidden lg:flex md:absolute md:inset-0 md:pointer-events-none md:z-0">
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
              <div className="px-6">
                <div className="flex
    gap-6
    overflow-x-auto md:overflow-x-visible
    overflow-y-hidden
    snap-x snap-mandatory
    scroll-smooth
    no-scrollbar

    md:justify-center
    md:flex-wrap">
                  {reviews.slice(0,4).map((review, index) =>
                      index % 2 === 0 ? (
                          <StarReviewCard key={review._id} review={review} />
                      ) : (
                          <ImageReviewCard key={review._id} review={review} />
                      )
                  )}
                </div>
              </div>
          )}
        </section>

        {/* Size Chart Modal */}
        {showSizeChart && sizeChartImage && (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                onClick={() => setShowSizeChart(false)}
            >
              <div
                  className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto p-4 relative"
                  onClick={(e) => e.stopPropagation()}
              >
                <button
                    onClick={() => setShowSizeChart(false)}
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold z-10 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
                >
                  ×
                </button>
                <div className="flex flex-col items-center">
                  <h3 className="text-2xl font-bold mb-4 text-center">Size Chart</h3>
                  <img
                      src={sizeChartImage}
                      alt="Size Chart"
                      className="w-full h-auto max-w-3xl"
                  />
                </div>
              </div>
            </div>
        )}
      </>
  );
}