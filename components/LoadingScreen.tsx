"use client";

import Image from "next/image";

type LoadingScreenProps = {
    progress: number; // 0-100
};

export default function LoadingScreen({ progress }: LoadingScreenProps) {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F0FAF0]">
            <div className="relative">

                {/* Loading bubble */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2">
                    <div className="bg-[#A8CDB1] border-2 border-dashed border-[#6FA07A] rounded-lg px-5 py-1 text-lg font-semibold text-[#0A2F1B]">
                        Loading... {Math.round(progress)}%
                    </div>
                </div>

                <Image
                    src="/clown.png"
                    alt=""
                    width={90}
                    height={90}
                    className="absolute right-10 top-[-127px] pointer-events-none z-20"
                />

                {/* Main pill - container */}
                <div className="relative flex items-center rounded-xl shadow-md overflow-hidden bg-white">

                    {/* Progress bar background (full width placeholder) */}
                    <div className="absolute inset-0 bg-white"></div>

                    {/* Animated green progress bar */}
                    <div
                        className="absolute inset-y-0 left-0 bg-[#0A2F1B] transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>

                    {/* LEFT — GREEN (text layer) */}
                    <div className="relative z-10 px-6 py-4 flex items-center">
            <span className="font-gotham font-extrabold text-[#B7D6C1] text-2xl tracking-wide">
              ALCHER
            </span>
                    </div>

                    {/* RIGHT — WHITE (text layer) */}
                    <div className="relative z-10 px-6 py-4 flex items-center">
            <span className="font-gotham font-extrabold text-[#9FB5A8] text-2xl tracking-wide">
              STORE 2026
            </span>
                    </div>
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