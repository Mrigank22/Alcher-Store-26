"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function AddReview({
  product_id,
  onSuccess,
}: {
  product_id: string;
  onSuccess: () => void;
}) {
  const { data: session } = useSession();

  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  async function submitReview() {
    if (!session?.user?.name) {
      alert("Please login to add a review");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id,                 // ✅ FIXED
        content,
        rating,
        userName: session.user.name, // ✅ REQUIRED
        userId: session.user.id,     // optional
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.json();
      console.error("Review error:", err);
      alert("Failed to submit review");
      return;
    }

    setContent("");
    setRating(5);
    onSuccess();
  }

  return (
    <div className="mt-6 border-t border-zinc-800 pt-6">
      <h3 className="text-lg font-semibold mb-2">Add a review</h3>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white"
        placeholder="Write your review..."
      />

      <div className="flex items-center gap-3 mt-3">
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="bg-zinc-900 border border-zinc-700 rounded p-1"
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} ★
            </option>
          ))}
        </select>

        <button
          onClick={submitReview}
          disabled={loading}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
}
