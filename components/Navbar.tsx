"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-[#052e16] text-white py-2.5 sm:py-3 md:py-3.5 px-3 sm:px-4 md:px-6 lg:px-8 relative z-50 shadow-md">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between h-12 sm:h-13 md:h-14">
        
        {/* LEFT: Store Icon & Text */}
        <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 w-[30%] sm:w-[32%] md:w-1/3">
          <div className="relative w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0">
             <Image src="/store-icon.png" alt="Store" fill className="object-contain" />
          </div>
          <span className="font-montserrat font-bold text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs tracking-[0.12em] uppercase hidden sm:block whitespace-nowrap">
            ALCHER STORE
          </span>
        </div>

        {/* CENTER: Main Logo (Absolute Center) */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 sm:w-36 md:w-44 lg:w-48">
           <Link href="/">
             <Image 
               src="/logo.png" 
               alt="Alcheringa Logo" 
               width={200} 
               height={80} 
               className="w-full h-auto object-contain"
               priority
             />
           </Link>
        </div>

        {/* RIGHT: Cart & Login */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 md:gap-4 w-[30%] sm:w-[32%] md:w-1/3">
          
          {/* Cart Button */}
          <Link 
            href="/cart" 
            className="flex items-center gap-1.5 sm:gap-2 bg-[#2d523e] hover:bg-[#3e6650] px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full transition-all"
          >
            <div className="relative w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0">
              <Image src="/cart-icon.png" alt="Cart" fill className="object-contain" />
            </div>
            <span className="text-[9px] sm:text-[10px] md:text-xs font-semibold uppercase tracking-[0.05em] whitespace-nowrap">Cart</span>
          </Link>

          {/* Login Button */}
          <Link 
            href="/login" 
            className="hidden sm:flex items-center bg-white text-[#052e16] hover:bg-gray-200 px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 rounded-full transition-colors"
          >
            <span className="text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-[0.05em] whitespace-nowrap">Login</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            className="sm:hidden text-white p-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="sm:hidden absolute top-full left-0 w-full bg-[#052e16] border-t border-white/10 p-4 flex flex-col items-center gap-3 shadow-xl">
          <Link 
            href="/login" 
            className="bg-white text-[#052e16] px-8 py-2.5 rounded-full font-bold text-xs w-full text-center uppercase tracking-wide"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            LOGIN
          </Link>
        </div>
      )}
    </nav>
  );
}