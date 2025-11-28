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
  discountGold: { type: Number, default: 0, required: true },
  discountPlatinum: { type: Number, default: 0, required: true },
  avgRating: { type: Number, default: 0 },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  isSubscribed: {
    type: Boolean,
    default: false
  },
  embeddings: {
    type: [Number],    
    required: false,  
    default: []
  }
},
  { timestamps: true }
);

export const gemModel = mongoose.model("gem", gemSchema);
