// "use client";

// import Image from "next/image";

// export default function LoadingScreen() {
//   return (
//     <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F0FAF0]">
//       <div className="relative flex flex-col items-center">

//         {/* Loading bubble */}
//         <div className="absolute -top-10 left-1/2 -translate-x-1/2">
//           <div className="bg-[#A8CDB1] border-2 border-dashed border-[#6FA07A] rounded-lg px-4 py-1 text-sm font-semibold text-green-950">
//             Loading...
//           </div>
//         </div>

//         {/* Main Card */}
//         <div className="relative flex items-center rounded-xl shadow-lg bg-white overflow-hidden">

//           {/* Left dark block */}
//           <div className="bg-[#021B05] px-3 py-4">
//             <h1 className="font-gotham font-extrabold text-[#A7C5AA] text-xl sm:text-2xl tracking-wide">
//               ALCHER
//             </h1>
//           </div>

//           {/* Right white block */}
//           <div className="px-6 py-4">
//             <h1 className="font-gotham font-extrabold text-[#A7C5AA] text-xl sm:text-2xl tracking-wide">
//               STORE 2026
//             </h1>
//           </div>
//         </div>

//         {/* Decorative images */}
//         <Image
//           src="/clover.png"
//           alt="Clover"
//           width={40}
//           height={40}
//           className="absolute -left-6 bottom-0"
//         />

//         <Image
//           src="/clown.png"
//           alt="Clown"
//           width={60}
//           height={60}
//           className="absolute right-0 -top-2"
//         />
//       </div>
//     </div>
//   );
// }

"use client";

import Image from "next/image";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F0FAF0]">
      <div className="relative">

        {/* Loading bubble */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2">
          <div className="bg-[#A8CDB1] border-2 border-dashed border-[#6FA07A] rounded-lg px-5 py-1 text-lg font-semibold text-[#0A2F1B]">
            Loading...
          </div> 
        </div>
      
          <Image
    src="/clown.png"
    alt=""
    width={90}
    height={90}
    className="
      absolute
      right-10
      top-[-127px]
      pointer-events-none
      z-20
    "
  />
        {/* Main pill */}
        <div className="relative flex items-center rounded-xl shadow-md overflow-hidden bg-white">

          {/* LEFT — GREEN */}
          <div className="bg-[#0A2F1B] px-6 py-4 flex items-center">
            <span className="font-gotham font-extrabold text-[#B7D6C1] text-2xl tracking-wide">
              ALCHER
            </span>
          </div>

          {/* RIGHT — WHITE */}
          <div className="px-6 py-4 flex items-center">
            <span className="font-gotham font-extrabold text-[#9FB5A8] text-2xl tracking-wide">
              STORE 2026
            </span>
          </div>

  

          {/* Character (overlapping but NOT text) */}
          
        </div>

        {/* Decorations */}
        <Image
          src="/image486.png"
          alt=""
          width={48}
          height={48}
          className="absolute -left-6 bottom-0 pointer-events-none"
        />

        <Image
          src="/image487.png"
          alt=""
          width={44}
          height={44}
          className="absolute right-0 -bottom-6 pointer-events-none"
        />
      </div>
    </div>
  );
}

