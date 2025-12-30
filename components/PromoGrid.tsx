import Image from "next/image";

export default function PromoGrid() {
  return (
    <section className="w-full bg-[#F0FAF0] font-gotham">
      {/* OUTER SAFE PADDING */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div
          className="
            w-full
            max-w-7xl
            mx-auto
            grid
            grid-cols-1
            md:grid-cols-2
            gap-4
            md:gap-1
            py-6
            md:h-[85vh]
          "
        >
          {/* CARD 1 */}
          <div className="rounded-3xl bg-[#A7C5AA] flex items-center justify-center p-6 sm:p-8 md:p-10 text-center">
            <div>
              <p className="text-xs sm:text-sm font-bold tracking-wide mb-2 text-black">
                FOR THE FIRST TIME
              </p>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-snug text-black">
                ALCHERINGA <br />
                MERCH AVAILABLE <br />
                <span className="text-green-700">ONLINE</span>
              </h2>
            </div>
          </div>

          {/* CARD 2 — KING */}
          <div className="relative rounded-2xl bg-[#021B05] p-6 sm:p-8 flex items-center justify-center font-bahianita overflow-hidden">
            {/* TEXT */}
            <h2 className="relative z-10 text-4xl sm:text-6xl md:text-8xl tracking-wide text-green-200 text-center">
              ALCHER <br /> 2026
            </h2>

            {/* KING IMAGE (RESPONSIVE + SAFE) */}
            <Image
              src="/frames/king.png"
              alt="King"
              width={400}
              height={560}
              className="
                absolute
                bottom-[6%]
                left-[68%]
                -translate-x-1/2
                translate-y-1/2
                w-[clamp(110px,22%,190px)]
                z-0
                opacity-80
                pointer-events-none
              "
            />
          </div>

          {/* CARD 3 — PLAYING CARD */}
          <div className="relative rounded-2xl bg-[#021B05] p-6 sm:p-8 flex items-center justify-center font-bahianita overflow-hidden">
            {/* TEXT */}
            <h2 className="relative z-10 text-4xl sm:text-6xl md:text-8xl tracking-wide text-green-200 text-center">
              THE GRAND <br /> SHUFFLE
            </h2>

            {/* CARD IMAGE (RESPONSIVE + SAFE) */}
            <Image
              src="/frames/card.png"
              alt="Card"
              width={300}
              height={450}
              className="
                absolute
                bottom-[8%]
                left-[18%]
                -translate-x-1/2
                translate-y-1/2
                w-[clamp(70px,18%,120px)]
                rotate-[15deg]
                z-0
                opacity-80
                pointer-events-none
              "
            />
          </div>

          {/* CARD 4 */}
          <div className="rounded-2xl bg-[#A7C5AA] flex items-center justify-center p-6 sm:p-8 md:p-10 text-center">
            <div>
              <p className="text-xs sm:text-sm font-bold tracking-wide mb-2 text-black">
                GET YOUR MERCH DELIVERED
              </p>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black leading-snug text-black">
                FROM US TO <br />
                <span className="text-green-700">ANYWHERE</span> <br />
                IN INDIA
              </h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
