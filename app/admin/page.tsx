"use client";

import { useEffect, useState } from "react";


const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;

type Size = typeof SIZES[number];
type SizeStock = Record<Size, string>;

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);

  const [form, setForm] = useState({
    product_id: "",
    name: "",
    img: "",
    price: "",
    size_boolean: false,
    stock_quantity: "",
  });

  const [sizeStock, setSizeStock] = useState<SizeStock>(
    Object.fromEntries(SIZES.map((s) => [s, ""])) as SizeStock
  );


  const fetchProducts = async () => {
    const res = await fetch("/api/admin/product");
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);


  const handleSubmit = async () => {
    if (!form.product_id || !form.name || !form.price) {
      alert("Please fill required fields");
      return;
    }

    let payload: any = {
      product_id: form.product_id,
      name: form.name,
      img: form.img,
      price: Number(form.price),
      size_boolean: form.size_boolean,
    };

    if (form.size_boolean) {
      payload.stock = Object.entries(sizeStock)
        .filter(([_, qty]) => Number(qty) > 0)
        .map(([size, qty]) => ({
          size,
          quantity: Number(qty),
        }));

      if (payload.stock.length === 0) {
        alert("Enter stock for at least one size");
        return;
      }
    } else {
      if (!form.stock_quantity) {
        alert("Enter stock quantity");
        return;
      }
      payload.stock_quantity = Number(form.stock_quantity);
    }

    await fetch("/api/admin/product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    alert("Product added successfully");


    setForm({
      product_id: "",
      name: "",
      img: "",
      price: "",
      size_boolean: false,
      stock_quantity: "",
    });

    setSizeStock(
      Object.fromEntries(SIZES.map((s) => [s, ""])) as SizeStock
    );

    fetchProducts();
  };


  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>

          <button
            onClick={() => window.open("/api/admin/export")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Export to Excel
          </button>
        </div>

        {/* ADD PRODUCT */}
        <div className="border rounded-lg p-6 mb-10">
          <h2 className="text-lg font-semibold mb-4">Add Product</h2>

          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Product ID"
              className="border px-3 py-2 rounded"
              value={form.product_id}
              onChange={(e) =>
                setForm({ ...form, product_id: e.target.value })
              }
            />

            <input
              placeholder="Product Name"
              className="border px-3 py-2 rounded"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              placeholder="Image URL"
              className="border px-3 py-2 rounded col-span-2"
              value={form.img}
              onChange={(e) => setForm({ ...form, img: e.target.value })}
            />

            <input
              type="number"
              placeholder="Price"
              className="border px-3 py-2 rounded"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.size_boolean}
                onChange={(e) =>
                  setForm({ ...form, size_boolean: e.target.checked })
                }
              />
              Has size variants
            </label>
          </div>


          {form.size_boolean && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {SIZES.map((size) => (
                <input
                  key={size}
                  type="number"
                  placeholder={`${size} Qty`}
                  className="border px-3 py-2 rounded"
                  value={sizeStock[size]}
                  onChange={(e) =>
                    setSizeStock({
                      ...sizeStock,
                      [size]: e.target.value,
                    })
                  }
                />
              ))}
            </div>
          )}


          {!form.size_boolean && (
            <input
              type="number"
              placeholder="Stock Quantity"
              className="border px-3 py-2 rounded mt-4"
              value={form.stock_quantity}
              onChange={(e) =>
                setForm({ ...form, stock_quantity: e.target.value })
              }
            />
          )}

          <button
            onClick={handleSubmit}
            className="mt-6 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            Add Product
          </button>
        </div>


        <div>
          <h2 className="text-lg font-semibold mb-4">All Products</h2>

          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2">Product ID</th>
                  <th className="border px-3 py-2">Name</th>
                  <th className="border px-3 py-2">Price</th>
                  <th className="border px-3 py-2">Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td className="border px-3 py-2">{p.product_id}</td>
                    <td className="border px-3 py-2">{p.name}</td>
                    <td className="border px-3 py-2">₹{p.price}</td>
                    <td className="border px-3 py-2">
                      {p.size_boolean
                        ? p.stock
                            .map(
                              (s: any) => `${s.size}: ${s.quantity}`
                            )
                            .join(", ")
                        : p.stock_quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
