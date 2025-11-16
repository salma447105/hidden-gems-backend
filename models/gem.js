import mongoose from "mongoose";

const gemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  images: [{ type: String }],
  gemLocation: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "rejected", "accepted"],
    default: "pending",
  },
  discount: { type: Number, default: 0 },
  discoountPremium: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    require: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    require: true,
  },
  isSubscribed: {
    type: Boolean,
    default: false
  }
});

export const gemModel = mongoose.model("gem", gemSchema);
