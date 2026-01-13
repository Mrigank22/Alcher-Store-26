"use client";

import Navbar from "@/components/Navbar";
import Image from "next/image";
import Footer from "@/components/Footer";
import MerchBox from "@/components/MerchBox" ;
import PromoGrid from "@/components/PromoGrid"
import Newsletter from "@/components/Newsletter";
import StarReviewCard from "@/components/reviews/StarReviewCard";
import ImageReviewCard from "@/components/reviews/ImageReviewCard";
import { useEffect, useState } from "react";


type Review = {
  _id: string;
  userName: string;
  content: string;
  rating: number;
  createdAt: string;
};

export default function Home() {
  function BannerCarousel() {
  const images = [
    "/banner_01.png",
    "/banner_02.png",
    "/banner_03.png",
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(interval);
  },);

  return (
    <div className="relative w-full overflow-hidden ">
      <div className="relative w-full h-[200px] sm:h-[600px] md:h-[600px] lg:h-screen">
        {images.map((src, index) => (
          <Image
            key={index}
            src={src}
            alt={`Banner ${index + 1}`}
            fill
            priority={index === 0}
            className={`
              absolute
              transition-opacity
              duration-700

              object-cover
              object-center
              ${index === current ? "opacity-100 z-10" : "opacity-0 z-0"}
            `}
          />
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2 w-2 rounded-full transition-all
              ${index === current ? "bg-white w-4" : "bg-white/50"}
            `}
          />
        ))}
      </div>
    </div>
  );
}

  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
  try {
    const res = await fetch("/api/reviews"); // ✅ no productId
    const data = await res.json();
    setReviews(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Review fetch error:", err);
    setReviews([]);
  }
}

  return (
    <main className="min-h-screen bg-[#F2FBF6] relative overflow-hidden font-sans flex flex-col">
      <Navbar />
      {/* ===== TOP BANNER CAROUSEL ===== */}
      {/* --- HERO SECTION --- */} <BannerCarousel />
      <div className="flex-1 flex flex-col items-center relative max-w-[1920px] mx-auto w-full">
       
        {/* ===== BOTTOM BANNER (ONLY DIALOGUE MOVED) ===== */}
        <div className="relative mt-0 sm:mt-0 md:mt-0 lg:mt-0 mb-0 sm:mb-0 w-full flex justify-center items-end z-40 bg-[#F0FAF0]">
          <div className="relative flex items-end">

            {/* Dialogue box — slightly up & closer to clown */}
            <div className="relative z-50 -translate-y-4 sm:-translate-y-6 -mr-2 sm:mr-0">
              <div className="relative w-[250px] sm:w-[300px] md:w-[410px] lg:w-[500px] h-[70px] sm:h-[90px] md:h-[110px] lg:h-[130px]">
                <Image src="/dialogue-box.png" alt="Dialogue" fill className="object-contain" />
                <div className="absolute inset-0 flex items-center justify-center -mt-2 sm:-mt-3">
                  <h3 className="font-gotham font-black text-[#052e16] text-xs sm:text-sm md:text-base lg:text-lg uppercase tracking-[0.06em]">
                    Order Your Merch Today
                  </h3>
                </div>
              </div>
            </div>

            {/* Clown — UNCHANGED */}
            <div className="relative w-24 h-32 sm:w-36 sm:h-44 md:w-44 md:h-56 lg:w-52 lg:h-64 -ml-6 sm:-ml-8 md:-ml-10">
              <Image src="/clown.png" alt="Clown" fill className="object-contain object-bottom" />
            </div>

          </div>
        </div>
      </div>

      <MerchBox showHeading={true}/>
      <PromoGrid/>

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

      <Newsletter />
      <Footer />
    </main>
  );
}
