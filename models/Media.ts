import mongoose, { Schema, models, model } from "mongoose";

const MediaSchema = new Schema(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true }, // 👈 THIS is what frontend needs
    alt: { type: String },
  },
  { timestamps: true }
);

export default models.Media || model("Media", MediaSchema);
