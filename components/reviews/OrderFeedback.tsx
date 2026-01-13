"use client";

import { useEffect, useState } from "react";

type Props = {
  orderId: string;
};

export default function OrderFeedback({ orderId }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if feedback already exists
  useEffect(() => {
    const checkFeedback = async () => {
      const res = await fetch(
        `/api/feedback?where[order][equals]=${orderId}`
      );
      const data = await res.json();
      if (data.totalDocs > 0) {
        setSubmitted(true);
      }
    };

    checkFeedback();
  }, [orderId]);

  const submitFeedback = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: orderId,
          rating,
          comment,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <p className="text-emerald-900 font-medium mt-4">
        ✅ Feedback already submitted. Thank you!
      </p>
    );
  }

  return (
    <div className="border-t border-gray-200 mt-6 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg  font-bold">
          Liked our Product? Leave a Feedback
        </h3>
  
        <button
          onClick={submitFeedback}
          disabled={rating === 0 || loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-full font-medium disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
  
      <p className="text-sm text-bold text-gray-1000 mb-2">Rate this Order</p>
  
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className={`text-2xl transition ${
              rating >= star ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            ★
          </button>
        ))}
      </div>
  
      <p className="text-sm text-gray-700 mb-2">
        Write Your Feedback (Optional)
      </p>
  
      <textarea
        placeholder="Enter Text Here"
        className="w-full border border-green-200 rounded-xl p-4 bg-green-50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
    </div>
  );
}  