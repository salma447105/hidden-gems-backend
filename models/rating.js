import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  gem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "gem",
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  }
},{ timestamps: true});

export const ratingModel = mongoose.model("rating", ratingSchema);
