import mongoose, { Schema, model, models } from "mongoose";

const SubscriberSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Prevents duplicate emails
    },
    isSubscribed: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Subscriber = models.Subscriber || model("Subscriber", SubscriberSchema);

export default Subscriber;