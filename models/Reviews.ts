import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    /* Product */
    product_id: {
      type: String,
      required: true,
      index: true,
    },

    /* User */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    userName: {
      type: String,
      trim: true,
      required: true,
    },

    /* Review content */
    content: {
      type: String,
      trim: true,
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    userImage: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Review || mongoose.model("Review", reviewSchema);
