import Image from "next/image";

export default function JokerNew() {
  return (
    <section className=" bg-gradient-to-b from-[#F2FAF2] to-[#05360B1A] pt-10 pb-0">
      <div className="max-w-6xl mx-auto px-6 flex justify-center relative h-[150px]">
        <div className="relative">
          <Image
            src="/joker.png"
            alt="character"
            width={300}
            height={300}
            priority
            className="
              absolute
            -left-20 md:-left-44
             top-[57%] md:top-1/2
              -translate-y-1/2
              select-none
            "
          />
            <span
               className="
                absolute
                left-[34px] md:left-[14px]
                top-[25px] md:top-[44px]
                -translate-y-1/2
                w-7
                h-7
                bg-[#A7C5AA]
                rotate-45
                z-0
              "
            />
            <div className=" left-10 md:left-5 relative bg-[#A7C5AA] rounded-2xl  p-[5px] md:p-2 z-10">
            <div
              className="
                border-2 border-dashed border-white
                rounded-xl
                px-4 py-1
                md:px-7 md:py-3
                text-[#021B05]
                whitespace-nowrap
                relative
                text-base
                font-medium
              "
            >
              Wanna see something new ?!
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}