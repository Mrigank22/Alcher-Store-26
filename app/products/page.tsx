import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AddtoCart from "./AddtoCart";
import { headers } from "next/headers";

async function getProducts() {
  const h = await headers();
  const host = h.get("host");

  const res = await fetch(`http://${host}/api/admin/product`, {
    cache: "no-store",
  });

  return res.json();
}

export default async function ProductsPage() {
 const session = await getServerSession();

if (!session || !session.user || !session.user.email) {
  redirect("/login");
}

const email = session.user.email;
   const products = await getProducts();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((p: any) => (
          <div key={p._id} className="border p-4 rounded">
            <img
              src={p.img}
              className="h-40 w-full object-cover rounded"
            />
            <h2 className="font-semibold mt-2">{p.name}</h2>
            <p>₹{p.price}</p>

            <AddtoCart
              productId={p._id}
              email={email}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
