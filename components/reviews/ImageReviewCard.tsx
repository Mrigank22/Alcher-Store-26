import Image from "next/image";
import { Review } from "./ReviewTypes";

export default function ImageReviewCard({ review }: { review: Review }) {
  return (
    <div
  className="
    relative
    w-[260px]
    h-[360px]
    shrink-0
    snap-center
    rounded-xl
    bg-white
    flex flex-col items-center justify-between p-5
  "
  style={{
    outline: "2px dashed #4ECA5E",
    outlineOffset: "-10px",
  }}
>

  <Image
  src="/image457.png"
  alt=""
  width={44}
  height={49}
  className="absolute top-[80px] left-0"/>

   <Image
  src="/image458.png"
  alt=""
  width={49}
  height={66}
  className="absolute top-[120px] right-0"/>

  <Image
  src="/image459.png"
  alt=""
  width={32}
  height={35}
  className="absolute top-[300px] -left-2"/>

  <Image
  src="/image443.png"
  alt=""
  width={40}
  height={53}
  className="absolute top-[305px] right-1"/>

   <Image
  src="/image457.png"
  alt=""
  width={21}
  height={24}
  className="absolute top-[10px] right-2"/>

  
   <Image
  src="/number4.png"
  alt="4"
  width={14}
  height={22}
  className="absolute top-[30px] right-3"/>
      {/* USER IMAGE PLACEHOLDER / IMAGE */}
      {review.userImage && (
        <div className="w-full h-[150px] rounded-md overflow-hidden mt-2 bg-gray-200">
          <Image
            src={review.userImage}
            alt={review.userName}
            width={520}
            height={280}
            className="object-cover w-full h-full"
          />
        </div>
      )}

      {/* CONTENT */}
      <div className="text-center px-2">
        <h3 className="font-medium text-xl uppercase text-[#1B9328]">
          Best Merch Ever
        </h3>

        <p className="text-sm text-[#1B9328] mt-2">
          {review.content}
        </p>
      </div>

      {/* FOOTER */}
      <div className="w-full text-center text-xs text-[#1B9328] pt-2 border-t border-black">
        {review.userName.toUpperCase()}
      </div>
    </div>
  );
}
