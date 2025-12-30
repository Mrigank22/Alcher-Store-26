"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"signup" | "verify">("signup");
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setLoading(true);
    // Simulate API
    setTimeout(() => { 
        setLoading(false); 
        setMessage("OTP sent to your email"); 
        setStep("verify"); 
    }, 1500);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); router.push("/login"); }, 1500);
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setMessage("OTP Resent"); }, 1000);
  };

  return (
    <AuthLayout>
        <div className="bg-white w-full max-w-[850px] rounded-[30px] shadow-2xl p-8 sm:p-12 md:p-14 border border-gray-100 relative mt-4">
          
          {/* Card-Attached Shamrocks */}
          <div className="absolute -top-6 -left-6 md:-top-1 md:-left-9 w-14 h-14 md:w-20 md:h-20 z-30 -rotate-12">
             <Image src="/images/auth/shamrock-light.png" alt="decor" fill className="object-contain" />
          </div>
          <div className="absolute bottom-[30%] left-[-10%] w-24 h-24 md:w-36 md:h-36 z-20 opacity-90">
             <Image src="/images/auth/shamrock-dark.png" alt="decor" fill className="object-contain" />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-sans font-black text-2xl md:text-4xl text-black mb-4">
              {step === "signup" ? "Create New Account" : "Verify Your Email"}
            </h1>
            <p className="text-gray-500 text-xs md:text-sm max-w-lg mx-auto leading-relaxed font-medium">
              {step === "signup" ? "Creating an account lets you place orders easily and track them anytime." : `We've sent a 6-digit OTP to ${form.email}`}
            </p>
          </div>

          {message && (
            <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-lg text-sm text-center">
              {message}
            </div>
          )}

          <hr className="border-gray-200 mb-8" />

          {step === "signup" ? (
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm text-black ml-1">First Name</label>
                  <input name="name" onChange={handleChange} placeholder="First Name" className="w-full bg-[#EFF7F0] border border-gray-400 rounded-xl px-6 py-3.5 outline-none focus:border-[#18B123] text-black font-medium" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm text-black ml-1">Last Name</label>
                  <input name="lastName" onChange={handleChange} placeholder="Last Name" className="w-full bg-[#EFF7F0] border border-gray-400 rounded-xl px-6 py-3.5 outline-none focus:border-[#18B123] text-black font-medium" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm text-black ml-1">Email ID</label>
                  <input type="email" name="email" onChange={handleChange} placeholder="example@email.com" className="w-full bg-[#EFF7F0] border border-gray-400 rounded-xl px-6 py-3.5 outline-none focus:border-[#18B123] text-black font-medium" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm text-black ml-1">Phone Number</label>
                  <input type="text" name="phone" onChange={handleChange} placeholder="Phone Number" className="w-full bg-[#EFF7F0] border border-gray-400 rounded-xl px-6 py-3.5 outline-none focus:border-[#18B123] text-black font-medium" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm text-black ml-1">Password</label>
                  <input type="password" name="password" onChange={handleChange} placeholder="Password" className="w-full bg-[#EFF7F0] border border-gray-400 rounded-xl px-6 py-3.5 outline-none focus:border-[#18B123] text-black font-medium" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm text-black ml-1">Confirm Password</label>
                  <input type="password" name="confirmPassword" onChange={handleChange} placeholder="Confirm Password" className="w-full bg-[#EFF7F0] border border-gray-400 rounded-xl px-6 py-3.5 outline-none focus:border-[#18B123] text-black font-medium" />
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                  <button type="submit" disabled={loading} className="bg-[#18B123] hover:bg-[#14991e] text-white font-bold py-3.5 px-20 rounded-full shadow-lg transition-transform active:scale-95 text-lg">
                    {loading ? "Creating..." : "Create Account"}
                  </button>
              </div>

              <p className="text-center text-sm mt-4 font-medium text-gray-600">
                Already have an account? <Link href="/login" className="text-[#18B123] font-bold hover:underline">Login</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="flex flex-col items-center">
                <label className="block text-sm font-bold mb-4 text-black">Enter Verification Code</label>
                <input type="text" placeholder="000000" className="w-full max-w-[300px] bg-[#EFF7F0] border border-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:border-[#18B123] text-center text-3xl tracking-[0.5em] font-bold text-black" onChange={(e) => setOtp(e.target.value)} maxLength={6} />
              </div>
              <div className="flex justify-center pt-2">
                <button type="submit" disabled={loading} className="bg-[#18B123] hover:bg-[#14991e] text-white font-bold py-3.5 px-16 rounded-full shadow-lg transition-transform active:scale-95 text-lg">
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
              <div className="text-center space-y-3 mt-4">
                <button type="button" onClick={handleResendOTP} className="text-sm font-bold text-[#18B123] hover:underline">Resend OTP</button>
                <div><button type="button" onClick={() => setStep("signup")} className="text-sm text-gray-500 hover:text-black hover:underline">← Back to signup</button></div>
              </div>
            </form>
          )}

        </div>
    </AuthLayout>
  );
}