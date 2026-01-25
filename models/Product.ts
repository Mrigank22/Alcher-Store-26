import mongoose from "mongoose";

/* ================= Variant Schema ================= */
const variantSchema = new mongoose.Schema(
  {
    // For merch products: S, M, L, XL, XXL
    size: {
      type: String,
      enum: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
      required: false,
    },

    // For combos/other products: "Set 1", "Set 2", "Flawless", "Gambit", etc.
    variantName: {
      type: String,
      required: false,
    },

    // Detailed contents for combo variants
    variantDescription: {
      type: String,
      required: false,
    },

    // Images specific to this variant (for non-Merch categories)
    images: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Media",
      required: false,
      default: [],
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
  required: false,
  default: [],
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
