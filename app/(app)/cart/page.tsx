import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import CartItem from "./CartItem";
import Link from "next/link";
// import Navbar from "@/components/Navbar";

async function getCart(email: string) {
  const h = await headers();
  const host = h.get("host");

  const res = await fetch(
    `http://${host}/api/cart?email=${email}`,
    { cache: "no-store" }
  );

  return res.json();
}

export default async function CartPage() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const email = session.user.email;
  const cart = await getCart(email);

  return (

<div className="relative min-h-screen bg-[#F3F9F3] overflow-hidden">

  {/* <Navbar/> */}

<div className="hidden lg:flex absolute inset-0 pointer-events-none overflow-hidden z-0">

  <img
  src="/image516.png"
  alt=""
  className="absolute
  lg:top-[98px]
  lg:left-[-135px]"/>

  <img src="/image517.png" 
  alt="" 
  className="absolute
  lg:top-[100px]
  lg:left-[-100px]"/>

  <img src="/image514.png" 
alt=""
className="absolute
lg:top-[-90px]
lg:left-[995px]"/>

<img src="/image515.png"
alt=""
className="absolute
lg:top-[15px]
lg:left-[560px]"/>
</div>

<div className="lg:hidden flex absolute inset-0 pointer-events-none overflow-hidden z-0">
  <img src="/group410.png" alt="" 
  className="absolute
  top-[90px]
  left-0"/>
   <img src="/group409.png" alt="" 
  className="absolute
  top-[75px]
  right-0"/>
</div>
      <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-10 z-10">
        
        <h1 className="text-4xl font-medium text-[#021B05] text-center lg:text-left">Your Cart</h1>
        <p className="text-sm font-medium text-[#5E5E5E] mt-1 text-center lg:text-left pb-0">
          {cart.items?.length || 0} items are added.
        </p>

        {cart.items.length === 0 ? (
          <div className="text-center py-12">
            <p className="mb-4">Cart is empty</p>
            <Link
              href="/"
              className="bg-green-700 text-white px-6 py-2 rounded-lg"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* LEFT */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item: any, i: number) => (
                <CartItem key={i} item={item} email={email} />
              ))}
            </div>

            {/* RIGHT: SUMMARY */}
            <div className="bg-white border border-black rounded-xl p-6 h-fit shadow-[4px_5px_4px_0px_rgba(0,0,0,0.25)]">
              <h2 className="font-semibold mb-4 text-xl">Order Summary</h2>

              <div className="space-y-2 text-sm text-[#5E5E5E] font-medium">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{cart.total_price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span>₹0</span>
                </div>
                <div className="flex justify-between">
                  <span>GST</span>
                  <span>₹0</span>
                </div>
              </div>

              <div className="border-t my-4 border-[#00000066]" />

              <div className="flex justify-between mb-6">
                <span className="text-sm text-[#5E5E5E] font-medium">Total</span>
                <span className="text-2xl text-black font-bold">₹{cart.total_price}</span>
              </div>

              <Link
                href="/checkout"
                className="block w-full bg-[#1B9328] text-white text-center py-3 rounded-full font-bold text-base"
              >
                Next
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
