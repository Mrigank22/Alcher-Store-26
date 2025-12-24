"use client";

import { useState } from "react";

const SIZES = ["S", "M", "L", "XL"] as const;

type Variant = {
  size?: string;
  color?: string;
  stock: number;
};

function generateProductId() {
  const num = Math.floor(100 + Math.random() * 900);
  return `ALCH${num}`;
}

export default function AddProductForm() {
  const [hasSize, setHasSize] = useState(false);
  const [hasColor, setHasColor] = useState(false);
  const [loading, setLoading] = useState(false);

  const [colors, setColors] = useState<string[]>([]);
  const [newColor, setNewColor] = useState("");

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    imageUrl: "",
    stock: 0,
    sizeStock: { S: 0, M: 0, L: 0, XL: 0 },
    sizeColorStock: {} as Record<string, number>,
  });

  /* ================= HELPERS ================= */

  function resetColorState() {
    setColors([]);
    setForm((f) => ({ ...f, sizeColorStock: {} }));
  }

  function addColor() {
    const c = newColor.trim().toLowerCase();
    if (!c || colors.includes(c)) return;
    setColors([...colors, c]);
    setNewColor("");
  }

  function removeColor(color: string) {
    setColors(colors.filter((c) => c !== color));
    setForm((f) => {
      const updated = { ...f.sizeColorStock };
      Object.keys(updated).forEach((k) => {
        if (k.endsWith(`|${color}`)) delete updated[k];
      });
      return { ...f, sizeColorStock: updated };
    });
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit() {
    if (!form.name.trim()) return alert("Product name required");
    if (Number(form.price) <= 0) return alert("Invalid price");

    let variants: Variant[] = [];

    // SIMPLE
    if (!hasSize && !hasColor) {
      if (form.stock <= 0) return alert("Stock must be > 0");
      variants = [{ stock: form.stock }];
    }

    // SIZE ONLY
    if (hasSize && !hasColor) {
      variants = Object.entries(form.sizeStock)
        .filter(([, qty]) => qty > 0)
        .map(([size, stock]) => ({ size, stock }));
    }

    // SIZE + COLOR
    if (hasSize && hasColor) {
      variants = Object.entries(form.sizeColorStock)
        .filter(([, qty]) => qty > 0)
        .map(([key, stock]) => {
          const [size, color] = key.split("|");
          return { size, color, stock };
        });
    }

    if (variants.length === 0) {
      return alert("At least one variant with stock is required");
    }

    try {
      setLoading(true);

      await fetch("/api/admin/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: generateProductId(), // ✅ FIX
          name: form.name,
          price: Number(form.price),
          description: form.description,
          imageUrl: form.imageUrl,
          hasSize,
          hasColor,
          variants,
        }),
      });

      alert("✅ Product added");

      // RESET
      setForm({
        name: "",
        price: "",
        description: "",
        imageUrl: "",
        stock: 0,
        sizeStock: { S: 0, M: 0, L: 0, XL: 0 },
        sizeColorStock: {},
      });
      setHasSize(false);
      setHasColor(false);
      setColors([]);
    } catch (err) {
      alert("❌ Failed to add product");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */

  return (
    <div className="max-w-2xl bg-zinc-900 p-6 rounded-xl text-white">
      <h2 className="text-2xl font-semibold mb-6">Add Product</h2>

      {["name", "price", "imageUrl"].map((f) => (
        <input
          key={f}
          className="w-full bg-zinc-800 p-2 rounded mb-3"
          placeholder={f}
          type={f === "price" ? "number" : "text"}
          value={(form as any)[f]}
          onChange={(e) => setForm({ ...form, [f]: e.target.value })}
        />
      ))}

      <textarea
        className="w-full bg-zinc-800 p-2 rounded mb-3"
        placeholder="Description"
        value={form.description}
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
      />

      <label className="flex gap-2 mb-2">
        <input
          type="checkbox"
          checked={hasSize}
          onChange={() => {
            setHasSize(!hasSize);
            if (hasSize) {
              setHasColor(false);
              resetColorState();
            }
          }}
        />
        Has Size
      </label>

      <label className="flex gap-2 mb-4">
        <input
          type="checkbox"
          checked={hasColor}
          disabled={!hasSize}
          onChange={() => setHasColor(!hasColor)}
        />
        Has Color
      </label>

      {!hasSize && (
        <input
          className="w-full bg-zinc-800 p-2 rounded"
          type="number"
          placeholder="Total Stock"
          onChange={(e) =>
            setForm({ ...form, stock: Number(e.target.value) })
          }
        />
      )}

      {hasSize && !hasColor && (
        <div className="grid grid-cols-2 gap-2">
          {SIZES.map((s) => (
            <input
              key={s}
              type="number"
              className="bg-zinc-800 p-2 rounded"
              placeholder={`${s} stock`}
              onChange={(e) =>
                setForm({
                  ...form,
                  sizeStock: {
                    ...form.sizeStock,
                    [s]: Number(e.target.value),
                  },
                })
              }
            />
          ))}
        </div>
      )}

      {hasSize && hasColor && (
        <>
          <div className="flex gap-2 my-3">
            <input
              className="flex-1 bg-zinc-800 p-2 rounded"
              placeholder="Add color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
            />
            <button onClick={addColor} className="bg-blue-600 px-4 rounded">
              Add
            </button>
          </div>

          {colors.map((color) => (
            <div key={color} className="mb-3">
              <div className="flex justify-between mb-1">
                <span>{color}</span>
                <button
                  onClick={() => removeColor(color)}
                  className="text-red-400 text-sm"
                >
                  remove
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SIZES.map((s) => (
                  <input
                    key={`${s}|${color}`}
                    type="number"
                    className="bg-zinc-800 p-2 rounded"
                    placeholder={`${s}`}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        sizeColorStock: {
                          ...form.sizeColorStock,
                          [`${s}|${color}`]: Number(e.target.value),
                        },
                      })
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      <button
        disabled={loading}
        onClick={handleSubmit}
        className="mt-6 w-full bg-green-600 py-2 rounded font-semibold disabled:opacity-60"
      >
        {loading ? "Adding..." : "Add Product"}
      </button>
    </div>
  );
}
