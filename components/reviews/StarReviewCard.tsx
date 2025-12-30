import Image from "next/image";
import { Review } from "./ReviewTypes";

export default function StarReviewCard({ review }: { review: Review }) {
  return (
    <div
  className="
    relative
    w-[260px]
    h-[360px]
    shrink-0
    snap-center
    rounded-xl
    bg-[#e6f3e4]
    border-2 border-[#b89b5e]
    flex flex-col items-center justify-between
  "
>


      {/* TOP ORNATE IMAGE */}
      <Image
        src="/review-border.png"
        alt="ornate top"
        width={260}
        height={80}
        className="absolute -top-1 left-1/2 -translate-x-1/2"
        priority
      />

      {/* CONTENT */}
      <div className="flex flex-col items-center text-center px-4 pt-20">
        <div className="text-red-500 text-lg mb-3">
          {"★".repeat(review.rating)}
          {"☆".repeat(5 - review.rating)}
        </div>

        <h3 className="font-medium text-2xl uppercase">
          Best Merch Ever
        </h3>

        <p className="text-sm text-black mt-3">
          {review.content}
        </p>
      </div>

      {/* FOOTER */}
      <div className="text-base text=[#474747] mb-10 border-t-[0.39px] border-black">
        {review.userName.toUpperCase()}
      </div>
    </div>
  );
}
