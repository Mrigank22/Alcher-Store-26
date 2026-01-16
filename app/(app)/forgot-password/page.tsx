"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action: "send-otp" }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setStep("otp");
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, action: "verify-otp" }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setStep("password");
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action: "send-otp" }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("OTP resent successfully!");
      } else {
        setError(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white w-full max-w-[600px] rounded-[30px] shadow-2xl p-8 sm:p-12 border border-gray-100 relative mt-4">
        <div className="text-center mb-8">
          <h1 className="font-sans font-black text-2xl md:text-4xl text-black mb-2">
            {step === "email" && "Forgot Password"}
            {step === "otp" && "Verify OTP"}
            {step === "password" && "Reset Password"}
          </h1>
          <p className="text-gray-500 text-sm">
            {step === "email" && "Enter your email to receive an OTP"}
            {step === "otp" && "Enter the 6-digit OTP sent to your email"}
            {step === "password" && "Enter your new password"}
          </p>
        </div>

        <hr className="border-gray-200 mb-8" />

        {message && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {step === "email" && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-black ml-1">Email ID</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full bg-[#EFF7F0] border border-gray-400 rounded-xl px-6 py-3.5 outline-none focus:border-[#18B123] text-black font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#18B123] hover:bg-[#14991e] text-white font-bold py-3.5 rounded-full shadow-md transition-transform active:scale-95 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
            <div className="text-center">
              <Link href="/login" className="text-sm text-[#18B123] font-bold hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-black ml-1">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit OTP"
                maxLength={6}
                required
                className="w-full bg-[#EFF7F0] border border-gray-400 rounded-xl px-6 py-3.5 outline-none focus:border-[#18B123] text-black font-medium text-center text-2xl tracking-widest"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#18B123] hover:bg-[#14991e] text-white font-bold py-3.5 rounded-full shadow-md transition-transform active:scale-95 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-sm text-[#18B123] font-bold hover:underline disabled:opacity-50"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-black ml-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="w-full bg-[#EFF7F0] border border-gray-400 rounded-xl px-6 py-3.5 outline-none focus:border-[#18B123] text-black font-medium"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-black ml-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full bg-[#EFF7F0] border border-gray-400 rounded-xl px-6 py-3.5 outline-none focus:border-[#18B123] text-black font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#18B123] hover:bg-[#14991e] text-white font-bold py-3.5 rounded-full shadow-md transition-transform active:scale-95 disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
