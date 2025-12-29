"use client";

import { useState } from "react";
import Image from "next/image";

export default function Newsletter() {
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        setFormData({ name: "", email: "" });
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Failed to connect to server");
    }
  };

  return (
    // overflow-hidden prevents horizontal scrollbar since images now stick out very far
    <div className="bg-[#021B02] py-24 px-6 sm:px-10 md:px-16 lg:px-24 flex justify-center w-full overflow-hidden relative">
      
      {/* Main Sage Green Card */}
      <div className="relative bg-[#A7C5AA] w-full max-w-[1400px] rounded-[24px] md:rounded-[40px] p-3 sm:p-4 shadow-2xl">
        
        {/* Inner Dashed Border Container */}
        <div className="border-[2px] md:border-[3px] border-dashed border-[#052e16]/30 rounded-[20px] md:rounded-[32px] py-12 px-4 sm:px-8 md:py-20 md:px-12 flex flex-col items-center text-center relative z-10 bg-[#A7C5AA]">
          
          {/* Headline */}
          <h2 className="font-montserrat font-black text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-black leading-tight mb-3">
            GET <span className="text-[#18B123]">UPDATES</span> ON <br />
            YOUR INBOX
          </h2>
          
          <p className="font-geist text-black/70 text-xs sm:text-sm md:text-base font-bold tracking-wide mb-10 max-w-xl">
            Get special offers and all the latest products delivered to your inbox!
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full max-w-4xl flex flex-col items-center gap-4">
            
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <input 
                type="text" 
                placeholder="Full Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="flex-1 bg-white rounded-full px-6 py-3 md:py-4 text-sm font-bold text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-[#18B123] shadow-sm"
              />
              
              <input 
                type="email" 
                placeholder="Email Address"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="flex-1 bg-white rounded-full px-6 py-3 md:py-4 text-sm font-bold text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-[#18B123] shadow-sm"
              />
              
              <button 
                type="submit"
                disabled={status === "loading" || status === "success"}
                className="bg-[#052e16] text-white rounded-full px-10 py-3 md:py-4 text-sm font-black uppercase tracking-wider hover:bg-black transition-all disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap shadow-md hover:scale-105"
              >
                {status === "loading" ? "..." : status === "success" ? "Joined!" : "Subscribe"}
              </button>
            </div>

            <div className="flex items-start gap-3 mt-3 text-left w-full md:pl-2">
              <input 
                type="checkbox" 
                id="terms" 
                className="mt-0.5 w-4 h-4 accent-[#052e16] cursor-pointer" 
              />
              <label htmlFor="terms" className="text-[10px] sm:text-xs text-black/60 font-medium leading-relaxed max-w-3xl cursor-pointer">
                Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
              </label>
            </div>

            {message && (
              <p className={`mt-2 text-sm font-bold ${status === "success" ? "text-green-900" : "text-red-700"}`}>
                {message}
              </p>
            )}
          </form>

        </div>

        {/* --- DECORATIONS (UPDATED POSITIONING) --- */}
        
        {/* Top Left Decoration - Pushed much further Left/Up to touch screen edge */}
        <div className="absolute -top-12 -left-10 sm:-top-16 sm:-left-20 md:-top-24 md:-left-32 lg:-top-32 lg:-left-44 w-40 sm:w-56 md:w-72 lg:w-[450px] z-20 pointer-events-none">
           <Image 
             src="/newsletter-top.png" 
             alt="Decoration Top" 
             width={500} 
             height={250} 
             className="object-contain"
           />
        </div>

        {/* Bottom Right Decoration - Pushed much further Right/Down */}
        <div className="absolute -bottom-8 -right-8 sm:-bottom-12 sm:-right-16 md:-bottom-16 md:-right-24 lg:-bottom-24 lg:-right-40 w-32 sm:w-48 md:w-64 lg:w-[400px] z-20 pointer-events-none">
           <Image 
             src="/newsletter-bottom.png" 
             alt="Decoration Bottom" 
             width={450} 
             height={220} 
             className="object-contain"
           />
        </div>

      </div>
    </div>
  );
}