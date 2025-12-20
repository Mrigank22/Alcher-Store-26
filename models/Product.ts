import mongoose, { Schema, models } from "mongoose";

const ReviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    review_content: { type: String },
    rating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

const StockSchema = new Schema({
  size: { type: String, required: true }, 
  quantity: { type: Number, required: true },
});


const ProductSchema = new Schema({
  product_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  img: { type: String, required: true },
  price: { type: Number, required: true },

  size_boolean: { type: Boolean, default: false },


  stock: {
    type: [StockSchema],
    default: [],
  },

  
  stock_quantity: {
    type: Number,
    default: 0,
  },
});

export default models.Product || mongoose.model("Product", ProductSchema);
