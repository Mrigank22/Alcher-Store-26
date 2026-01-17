import mongoose, { Schema } from "mongoose";

const DeliveryConfigSchema = new Schema({
  label: {
    type: String,
    default: "Standard Delivery Fee",
    required: true,
  },
  deliveryFee: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
});

export default mongoose.models.DeliveryConfig || mongoose.model("DeliveryConfig", DeliveryConfigSchema);
