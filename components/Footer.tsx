"use client";

import { Mail, Phone } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className="
        bg-[#021B02] text-[#A7C5AA]
        pt-10 pb-4
        px-4 sm:px-6 md:px-12 lg:px-20
        font-sans relative z-50
      "
    >
      <div className="max-w-[1920px] mx-auto flex flex-col">

        {/* ================= TOP SECTION ================= */}
        <div
          className="
            flex flex-col lg:flex-row
            justify-between items-start
            gap-10 md:gap-12 lg:gap-8
            mb-10 md:mb-12
          "
        >

          {/* ===== LEFT: LOGO + BUSINESS QUERIES ===== */}
          <div className="flex flex-col gap-8 max-w-[260px]">

            {/* Logo Block */}
            <div className="flex items-start gap-4">
              <div className="relative w-10 h-14 sm:w-12 sm:h-16 shrink-0 mt-1">
                <Image
                  src="/footer-icon.png"
                  alt="Alcheringa Icon"
                  fill
                  className="object-contain object-top"
                />
              </div>

              <div className="flex flex-col leading-none">
                <span className="font-geist font-medium text-[10px] sm:text-xs  tracking-wide opacity-90 mb-0.5">
                  IIT Guwahati&apos;s
                </span>

                <h1 className="font-geist font-bold text-2xl sm:text-4xl tracking-wide text-[#A7C5AA]">
                  Alcheringa
                </h1>

                <span className="font-geist font-bold text-[10px] sm:text-xs tracking-[0.2em] self-end mt-1 opacity-90">
                  2026
                </span>
              </div>
            </div>

            {/* Business Queries */}
            <div className="flex flex-col gap-1">
              <p className="font-geist text-sm opacity-80">
                For business related queries
              </p>
              <a
                href="mailto:alcheringa@iitg.ac.in"
                className="flex items-center gap-2 text-sm sm:text-base hover:text-white transition-colors underline underline-offset-4 decoration-[#A7C5AA]/50"
              >
                <Mail size={16} />
                <span>alcheringa@iitg.ac.in</span>
              </a>
            </div>
          </div>

          {/* ===== RIGHT: GENERAL QUERIES ===== */}
          <div className="flex flex-col gap-6 w-full lg:w-auto ">

            <p
              className="
                font-geist text-sm opacity-80
                text-left lg:text-left
                border-b border-[#A7C5AA]/20
                pb-2 lg:border-none lg:pb-0
              "
            >
              For General Queries
            </p>

            <div
              className="
                grid grid-cols-1 sm:grid-cols-2
                gap-8 sm:gap-16 lg:gap-24
              "
            >
              {/* Contact 1 */}
              <div className="flex flex-col gap-1">
                <h4 className="font-geist font-bold text-xl sm:text-2xl text-[#A7C5AA]">
                  Shashank
                </h4>
                <p className="font-geist text-xs opacity-80 mb-2 uppercase tracking-wide">
                  PR Head
                </p>
                <div className="flex flex-col gap-1.5">
                  <a
                    href="tel:9876543210"
                    className="flex items-center gap-2 text-xs sm:text-sm hover:text-white transition-colors group"
                  >
                    <Phone size={12} className="opacity-70 group-hover:opacity-100" />
                    <span>9876543210</span>
                  </a>
                  <a
                    href="mailto:mailID@alcheringa.in"
                    className="flex items-center gap-2 text-xs sm:text-sm hover:text-white transition-colors group"
                  >
                    <Mail size={12} className="opacity-70 group-hover:opacity-100" />
                    <span>mailID@alcheringa.in</span>
                  </a>
                </div>
              </div>

              {/* Contact 2 */}
              <div className="flex flex-col gap-1">
                <h4 className="font-geist font-bold text-xl sm:text-2xl text-[#A7C5AA]">
                  Khushi Gupta
                </h4>
                <p className="font-geist text-xs opacity-80 mb-2 uppercase tracking-wide">
                  PR Head
                </p>
                <div className="flex flex-col gap-1.5">
                  <a
                    href="tel:9876543210"
                    className="flex items-center gap-2 text-xs sm:text-sm hover:text-white transition-colors group"
                  >
                    <Phone size={12} className="opacity-70 group-hover:opacity-100" />
                    <span>9876543210</span>
                  </a>
                  <a
                    href="mailto:mailID@alcheringa.in"
                    className="flex items-center gap-2 text-xs sm:text-sm hover:text-white transition-colors group"
                  >
                    <Mail size={12} className="opacity-70 group-hover:opacity-100" />
                    <span>mailID@alcheringa.in</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= DIVIDER ================= */}
        <div className="w-full h-[1px] bg-[#A7C5AA]/20 my-3"></div>

        {/* ================= BOTTOM CREDITS ================= */}
        <div
          className="
            flex flex-col md:flex-row
            justify-between items-center
            gap-1
            text-[10px]
            uppercase tracking-[0.1em]
            opacity-60 font-medium
            text-center md:text-left
          "
        >
          <p>Designed by Team Creatives</p>
          <p>Developed by Team WebOps</p>
        </div>

      </div>
    </footer>
  );
}
