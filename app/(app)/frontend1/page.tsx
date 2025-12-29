"use client";

import Navbar from "@/components/Navbar";
import Image from "next/image";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";

export default function FirstPage() {
  return (
    <main className="min-h-screen bg-[#F2FBF6] relative overflow-hidden font-sans flex flex-col">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <div className="flex-1 flex flex-col items-center pt-3 sm:pt-5 md:pt-7 lg:pt-9 px-4 relative max-w-[1920px] mx-auto w-full">

        {/* Top Text */}
       {/* Top Secondary Text */}
<p
  className="
    font-geist
    font-medium
    uppercase
    text-[#6b6b6b]
    tracking-[0.14em]
    leading-none

    whitespace-nowrap
    text-center
    mx-auto
    relative
    z-40
    mb-2

    /* 🔻 mobile-first: VERY small */
    text-[8px]
    scale-[0.7]

    /* phones / small screens */
    sm:text-[9px]
    sm:scale-[0.78]

    /* ≥640px: relax slightly */
    md:text-[10px]
    md:scale-[0.9]
  "
>
  Buy Alcheringa 2026 Official Merchandise
</p>


        {/* HEADLINE */}
        <div className="relative w-full max-w-7xl min-[550px]:max-[639px]:max-w-[375px] mx-auto text-center z-40">
          <div className="flex flex-col items-center leading-none w-full">
            <h1 className="font-gotham font-black text-black text-[24px] xs:text-[32px] sm:text-[44px] md:text-[58px] lg:text-[76px] xl:text-[94px] leading-[0.95] whitespace-nowrap">
              OFFICIAL ALCHERINGA
            </h1>
            <h1 className="font-gotham font-black text-[#18B123] text-[24px] xs:text-[32px] sm:text-[44px] md:text-[58px] lg:text-[76px] xl:text-[94px] leading-[0.85] -mt-1 sm:-mt-2">
              MERCH
            </h1>
          </div>
        </div>

        {/* ===== CLOUD BAND ===== */}
        <div className="relative w-full max-w-[280px] min-[450px]:max-w-[380px] min-[550px]:max-w-[480px] sm:max-w-[600px] md:max-w-[900px] lg:max-w-[1100px] mx-auto z-10">
          <div
            className="
              absolute left-1/2 -translate-x-1/2
              -top-[45px] min-[450px]:-top-[58px] min-[550px]:-top-[75px] sm:-top-[95px] md:-top-[120px] lg:-top-[150px] xl:-top-[180px]
              w-[160%]
              h-[120px] min-[450px]:h-[155px] min-[550px]:h-[195px] sm:h-[240px] md:h-[280px] lg:h-[320px] xl:h-[360px]
              pointer-events-none
            "
          >
            <div className="absolute inset-0 z-10">
              <div className="absolute inset-0 -translate-y-[28%] scale-[0.95]">
                <Image src="/cloud-top-left.png" alt="Top Left Cloud" fill className="object-contain object-left" priority />
              </div>
              <div className="absolute inset-0 -translate-y-[40%] scale-[0.95]">
                <Image src="/cloud-top-right.png" alt="Top Right Cloud" fill className="object-contain object-right" priority />
              </div>
            </div>

            <div className="absolute inset-0 z-20">
              <div className="absolute left-0 top-0 h-full w-[92%]">
                <Image src="/cloud-left.png" alt="Left Cloud" fill className="object-contain object-left" priority />
              </div>
              <Image src="/cloud-right.png" alt="Right Cloud" fill className="object-contain object-right" priority />
            </div>
          </div>
        </div>

        {/* WHITE BOX */}
        <div className="relative w-full max-w-[300px] sm:max-w-[420px] md:max-w-[580px] lg:max-w-[760px] xl:max-w-[900px] min-[550px]:max-[639px]:max-w-[368px] -mt-2 sm:-mt-3 md:-mt-4 lg:-mt-5 xl:-mt-6 z-20">
          <div className="bg-white border-[2.5px] sm:border-[3px] md:border-[3.5px] border-dashed border-[#CCCCCC] rounded-[24px] sm:rounded-[32px] md:rounded-[40px] w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] shadow-lg flex items-center justify-center">
            <span className="opacity-20 font-gotham font-bold text-gray-300 text-sm sm:text-lg md:text-2xl">
              (MERCH DISPLAY IMAGE)
            </span>
          </div>
        </div>

        {/* ===== BOTTOM BANNER (ONLY DIALOGUE MOVED) ===== */}
        <div className="relative mt-8 sm:mt-12 md:mt-16 lg:mt-20 mb-4 sm:mb-6 w-full flex justify-center items-end z-40">
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

      <Newsletter />
      <Footer />
    </main>
  );
}
