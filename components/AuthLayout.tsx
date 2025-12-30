import Image from "next/image";
import { ReactNode } from "react";
import Navbar from "./Navbar";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#F0FAF0] relative overflow-hidden font-sans flex flex-col pt-[70px] md:pt-[100px]">
      
      {/* --- NAVBAR --- */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* --- BACKGROUND CLOUDS --- */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
         {/* Left Side */}
         <div className="absolute top-[60px] sm:top-[50px] -left-[20px] w-[280px] sm:w-[450px] md:w-[650px] z-10">
            <Image src="/images/auth/cloud-left.png" alt="Cloud Left" width={700} height={300} className="object-contain w-full" priority />
         </div>
         <div className="absolute top-0 left-0 w-[220px] sm:w-[350px] md:w-[480px] z-0">
            <Image src="/images/auth/cloud-top-left.png" alt="Cloud Top Left" width={500} height={400} className="object-contain w-full -translate-x-[15%] -translate-y-[15%]" priority />
         </div>

         {/* Right Side */}
         <div className="absolute top-[80px] sm:top-[50px] -right-[20px] w-[280px] sm:w-[450px] md:w-[800px] z-10">
            <Image src="/images/auth/cloud-right.png" alt="Cloud Right" width={700} height={300} className="object-contain w-full" priority />
         </div>
         <div className="absolute top-0 right-0 w-[220px] sm:w-[350px] md:w-[480px] z-0">
            <Image src="/images/auth/cloud-top-right.png" alt="Cloud Top Right" width={500} height={400} className="object-contain w-full translate-x-[10%] -translate-y-[15%]" priority />
         </div>
      </div>

      {/* --- BACKGROUND SHAMROCKS --- */}
      {/* 1. Top Left Gap */}
      <div className="absolute top-[120px] left-[35%] w-8 h-8 md:w-12 md:h-12 z-20 animate-bounce-slow opacity-90">
         <Image src="/images/auth/shamrock-1.png" alt="decor" fill className="object-contain" />
      </div>
      {/* 2. Top Right Gap */}
      <div className="absolute top-[130px] right-[25%] w-6 h-6 md:w-10 md:h-10 z-20 rotate-90 opacity-80">
         <Image src="/images/auth/shamrock-dark.png" alt="decor" fill className="object-contain" />
      </div>
      {/* 3. Mid Right */}
      <div className="absolute top-[50%] right-[16%] w-24 h-24 md:w-32 md:h-32 z-20 rotate-12 opacity-90">
         <Image src="/images/auth/shamrock-light.png" alt="decor" fill className="object-contain" />
      </div>
      {/* 4. Bottom Left */}
      <div className="absolute bottom-[10%] left-[5%] w-24 h-24 md:w-36 md:h-36 z-20 opacity-90">
         <Image src="/images/auth/shamrock-6.png" alt="decor" fill className="object-contain" />
      </div>
      {/* 5. Bottom Right */}
      <div className="absolute bottom-[10%] right-[10%] w-16 h-16 md:w-24 md:h-24 z-0 rotate-45 opacity-90">
         <Image src="/images/auth/shamrock-8.png" alt="decor" fill className="object-contain" />
      </div>

      {/* --- PAGE CONTENT --- */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-0">
        {children}
      </div>
    </main>
  );
}