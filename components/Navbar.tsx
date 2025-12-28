"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-[#052e16] text-white py-1.5 sm:py-2 md:py-2.5 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 relative z-50 shadow-md overflow-visible">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between h-9 sm:h-10 md:h-11 lg:h-12">
        
        {/* LEFT: Store Icon & Text */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 w-[28%] sm:w-[30%] md:w-[32%] lg:w-1/3">
          <div className="relative w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex-shrink-0">
             <Image src="/store-icon.png" alt="Store" fill className="object-contain" />
          </div>
          <span className="font-montserrat font-bold text-[7px] xs:text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-xs tracking-[0.12em] uppercase whitespace-nowrap">
            ALCHER STORE
          </span>
        </div>

        {/* CENTER: Main Logo (Absolute Center with Shadow) */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 xs:w-28 sm:w-32 md:w-40 lg:w-44 xl:w-48 z-10">
           <Link href="/" className="block">
             <div className="drop-shadow-[0_6px_10px_rgba(0,0,0,0.9)]">
               <Image 
                 src="/logo.png" 
                 alt="Alcheringa Logo" 
                 width={200} 
                 height={80} 
                 className="w-full h-auto object-contain"
                 priority
               />
             </div>
           </Link>
        </div>

        {/* RIGHT: Cart & Login */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 w-[28%] sm:w-[30%] md:w-[32%] lg:w-1/3">
          
          {/* Cart Button */}
          <Link 
            href="/cart" 
            className="flex items-center gap-1 sm:gap-1.5 md:gap-2 bg-[#2d523e] hover:bg-[#3e6650] px-2 xs:px-2.5 sm:px-3 md:px-3.5 lg:px-4 py-1.5 sm:py-1.5 md:py-2 rounded-full transition-all shadow-sm hover:shadow-md"
          >
            <div className="relative w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-4 md:h-4 flex-shrink-0">
              <Image src="/cart-icon.png" alt="Cart" fill className="object-contain" />
            </div>
            <span className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-[10px] lg:text-xs font-semibold uppercase tracking-[0.05em] whitespace-nowrap">Cart</span>
          </Link>

          {/* Login Button - Hidden on mobile */}
          <Link 
            href="/login" 
            className="hidden sm:flex items-center bg-white text-[#052e16] hover:bg-gray-100 px-3 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-1.5 md:py-2 rounded-full transition-colors shadow-sm hover:shadow-md"
          >
            <span className="text-[9px] sm:text-[10px] md:text-[10px] lg:text-xs font-black uppercase tracking-[0.05em] whitespace-nowrap">Login</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            className="sm:hidden text-white p-1 hover:bg-white/10 rounded transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="sm:hidden absolute top-full left-0 w-full bg-[#052e16] border-t border-white/10 p-4 flex flex-col items-center gap-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <Link 
            href="/login" 
            className="bg-white text-[#052e16] hover:bg-gray-100 px-8 py-2.5 rounded-full font-bold text-xs w-full max-w-xs text-center uppercase tracking-wide shadow-md transition-all"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            LOGIN
          </Link>
        </div>
      )}
    </nav>
  );
}