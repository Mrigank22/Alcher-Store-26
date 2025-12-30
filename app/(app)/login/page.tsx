"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn("credentials", { email, password, callbackUrl: "/dashboard" });
    setLoading(false);
  };

  return (
    <AuthLayout>
        <div className="bg-white w-full max-w-[850px] rounded-[30px] shadow-2xl p-8 sm:p-12 md:p-14 border border-gray-100 relative mt-4">
          
          <div className="absolute -top-6 -left-6 md:-top-1 md:-left-9 w-14 h-14 md:w-20 md:h-20 z-30 -rotate-12">
             <Image src="/images/auth/shamrock-light.png" alt="decor" fill className="object-contain" />
          </div>
          <div className="absolute bottom-[30%] left-[-10%] w-24 h-24 md:w-36 md:h-36 z-20 opacity-90">
             <Image src="/images/auth/shamrock-dark.png" alt="decor" fill className="object-contain" />
          </div>

          <div className="text-center mb-8">
            <h1 className="font-sans font-black text-2xl md:text-4xl text-black mb-4">Welcome to Alcher Store !</h1>
            <p className="text-gray-500 text-xs md:text-sm max-w-lg mx-auto leading-relaxed font-medium">
              Thank you for your order. Your items are being packed and will be shipped soon.
              <br className="hidden md:block"/>
              <span className="font-bold text-black">You can track your order in your profile section.</span>
            </p>
          </div>

          <hr className="border-gray-200 mb-8" />

          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-black ml-1">Email ID</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Text Here" className="w-full bg-[#EFF7F0] border border-gray-400 rounded-xl px-6 py-3.5 outline-none focus:border-[#18B123] text-black font-medium" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-black ml-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter Text Here" className="w-full bg-[#EFF7F0] border border-gray-400 rounded-xl px-6 py-3.5 outline-none focus:border-[#18B123] text-black font-medium" />
              <div className="text-right mt-1"><Link href="/forgot-password" className="text-xs text-[#18B123] font-bold hover:underline uppercase tracking-wide">FORGOT PASSWORD?</Link></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button type="submit" disabled={loading} className="flex-1 bg-[#18B123] hover:bg-[#14991e] text-white font-bold py-3.5 rounded-full shadow-md transition-transform active:scale-95 text-base">{loading ? "Logging in..." : "Log In"}</button>
                <button type="button" onClick={() => router.push("/signup")} className="flex-1 bg-[#D8EAD8] hover:bg-[#cce3cc] text-black font-bold py-3.5 rounded-full shadow-md transition-transform active:scale-95 text-base">New User? Sign Up</button>
            </div>
          </form>

          <div className="relative my-10"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div></div>

          <div className="flex justify-center mt-20">
            <button type="button" onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="flex items-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-black font-bold py-3 px-8 rounded-full shadow-sm transition-all text-sm sm:text-base group">
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Sign Up with Google</span>
            </button>
          </div>
        </div>
    </AuthLayout>
  );
}