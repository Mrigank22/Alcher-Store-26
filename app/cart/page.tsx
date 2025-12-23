import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import CartItem from "./CartItem";

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
      <h1 className="text-2xl font-bold mb-6">Cart</h1>

      {!cart.items || cart.items.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <>
          {cart.items.map((item: any, i: number) => (
            <CartItem
              key={i}
              item={item}
              email={email}
            />
          ))}

          <div className="mt-4 font-bold flex justify-between">
            <span>Total</span>
            <span>₹{cart.total_price}</span>
          </div>
        </>
      )}
    </div>
  );
}
