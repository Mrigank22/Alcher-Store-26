import Image from "next/image";
import Link from "next/link";

type Product = {
  product_id: string;
  name: string;
  price: number;
  imageUrl: string;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="w-full max-w-[460px] font-gotham">
      {/* IMAGE + FRAME */}
      <Link href={`/product/${product.product_id}`} className="block">
        <div
          className="
                    relative
                    w-full
                    aspect-[63/88]
                    max-h-[641.75px]
        "
        >
          {/* WHITE BACKGROUND (INSIDE FRAME) */}
          <div className="absolute inset-[1px] bg-white z-0" />

          {/* PRODUCT IMAGE (REAL) */}
          {/* <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain z-[1] p-4"
    /> */}

          {/* FRAME PNG */}
          <img
            src="/frames/product-frame.png"
            alt="Frame"
            className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none"
          />
        </div>
      </Link>

      {/* DIVIDER */}
      <div className="my-3 h-[1px] bg-black/100" />

      {/* TEXT + PRICE */}
      {/* <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-black/100">
            {product.name}
          </h3>
          <p className="text-base text-black/100">T-shirt</p>
        </div>

        <div className="w-32 h-12 bg-white shadow-[2px_2px_2px_0px_rgba(0,0,0,0.25)] outline outline-2 outline-offset-[-1px] outline-white  flex justify-center items-center">
          <h3 className="text-green-400 font-extrabold">
            Rs {product.price}/-
          </h3>
        </div>
      </div> */}

      {/* TEXT + PRICE */}
      <div className="flex items-center justify-between gap-4">
        {/* TEXT */}
        <div className="min-w-0">
          <h3
            className="
      text-sm 
      sm:text-base 
      lg:text-lg
      font-extrabold 
      text-black 
      truncate
    "
          >
            {product.name}
          </h3>

          <p
            className="
      text-xs 
      sm:text-sm 
      lg:text-base
      text-black
    "
          >
            T-shirt
          </p>
        </div>

        {/* PRICE BOX */}
        <div
          className="
          shrink-0
          px-3 
          py-2
          bg-white 
          shadow-[2px_2px_2px_0px_rgba(0,0,0,0.25)]
          outline 
          outline-2 
          outline-offset-[-1px] 
          outline-white  
          flex 
          justify-center 
          items-center
  "
        >
          <h3
            className="
                    text-xs 
                    sm:text-sm 
                    lg:text-base
                    text-green-400 
                    font-extrabold 
                    whitespace-nowrap
              "
          >
            Rs {product.price}/-
          </h3>
        </div>
      </div>
    </div>
  );
}
