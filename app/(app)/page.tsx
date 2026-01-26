"use client";

import Navbar from "@/components/Navbar";
import Image from "next/image";
import Footer from "@/components/Footer";
import MerchBox from "@/components/MerchBox" ;
import ComboSection from "@/components/ComboSection";
import CatalogueCarousel from "@/components/CatalogueCarousel";
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
    "/Banner_01.png",
    "/Banner_02.png",
    "/Banner_03.png",
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
                <div className="absolute inset-0 flex items-center justify-center  px-4 sm:px-6 md:px-8 -mt-2 sm:-mt-3">
                 <h3
  className="
    font-gotham font-black text-[#052e16] uppercase text-center
    text-[10px] sm:text-xs md:text-sm lg:text-base
    leading-[1.2] sm:leading-[1.25] md:leading-[1.3]
    tracking-[0.08em] sm:tracking-[0.07em] md:tracking-[0.06em]
  "
>
  <span className="block">PRE-ORDER IS OPEN!</span>
  <span className="block mt-1 sm:mt-2">DELIVERY STARTS FROM 28TH JAN.</span>
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

      {/* ===== NEW CLOWN DIALOGUE BETWEEN MERCH AND COMBO ===== */}
      <div className="relative w-full flex justify-center items-end z-40 bg-[#F0FAF0] pb-0">
        <div className="relative flex items-end gap-4 sm:gap-6">

          {/* Clown 2 - LEFT SIDE */}
          <div className="relative w-28 h-36 sm:w-36 sm:h-44 md:w-40 md:h-52 lg:w-48 lg:h-60">
            <Image src="/clown2.png" alt="Clown" fill className="object-contain object-bottom" />
          </div>

          {/* Dialogue box 2 - RIGHT SIDE */}
          <div className="relative z-50 mb-8 sm:mb-12">
            <div className="relative w-[250px] sm:w-[350px] md:w-[450px] lg:w-[500px] h-[70px] sm:h-[90px] md:h-[100px] lg:h-[110px]">
              <Image src="/dialogue-box2.png" alt="Dialogue" fill className="object-contain" />
              <div className="absolute inset-0 flex items-center justify-center px-6 sm:px-8 md:px-10">
               <h3
                className="
                  font-gotham font-black text-[#052e16] uppercase text-center
                  text-xs sm:text-sm md:text-base lg:text-lg
                  tracking-wider
                "
              >
                Wanna see something new ?!
              </h3>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ===== SEPARATOR LINE ===== */}
      <div className="w-full bg-[#F0FAF0]">
        <div className="border-t-2 border-gray-300"></div>
      </div>

      <ComboSection />
      <CatalogueCarousel />
      <PromoGrid/>

      <section className="relative min-h-screen bg-[#021B02] pt-20 overflow-x-hidden">
      
        <div className="hidden lg:flex md:absolute md:inset-0 md:pointer-events-none md:z-0">
          <img src="/image518.png" alt="" 
          className="absolute
          top-[100px]
          right-0"/>
          <img src="/image519.png" alt="" 
          className="absolute
          top-[250px]
          right-0"/>
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
