import mongoose from "mongoose";

/* ================= Variant Schema ================= */
const variantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      enum: ["S", "M", "L", "XL","XXL"],
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

    /* Category */
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: false,
    },

    /* Product Type */
    productType: {
      type: String,
      trim: true,
      default: "T-Shirt",
    },

    images: {
  type: [String],
  required: true,
  validate: {
    validator: (arr: string[]) => arr.length > 0,
    message: "At least one product image is required",
  },
},
primaryImageIndex: {
  type: Number,
  default: 0,
  min: 0,
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
