import mongoose from "mongoose";

/* ================= Variant Schema ================= */
const variantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      enum: ["S", "M", "L", "XL", "XXL"],
      required: false,
    },

    color: {
      type: String,
      required: false,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

/* ================= Product Schema ================= */
const productSchema = new mongoose.Schema(
  {
    product_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    /* Basic info */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      trim: true,
      default: "Alcher merch",
    },

    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },

    /* Flags */
    hasSize: {
      type: Boolean,
      default: false,
    },

    hasColor: {
      type: Boolean,
      default: false,
    },

    /* Variants */
    variants: {
      type: [variantSchema],
      required: true,
      validate: {
        validator: (v: any[]) => v.length > 0,
        message: "At least one variant is required",
      },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
