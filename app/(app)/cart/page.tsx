import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import CartItem from "./CartItem";
import Link from "next/link";

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

  if (!session || !session.user || !session.user.email) {
    redirect("/login");
  }

  const email = session.user.email;
  const cart = await getCart(email);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

      {!cart.items || cart.items.length === 0 ? (
        <div className="text-center py-8">
          <p className="mb-4">Cart is empty</p>
          <Link 
            href="/"
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          {cart.items.map((item: any, i: number) => (
            <CartItem
              key={i}
              item={item}
              email={email}
            />
          ))}

          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold">Total</span>
              <span className="text-xl font-bold">₹{cart.total_price}</span>
            </div>
            
            <Link 
              href="/checkout"
              className="block w-full bg-green-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
