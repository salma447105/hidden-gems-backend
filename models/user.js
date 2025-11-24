import mongoose from "mongoose";
import { nanoid } from "nanoid";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["user", "admin", "owner"],
    default: "user",
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  phoneNumber: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
  },
  points: {
    type: Number,
    default: 0,
  },
  subscription: {
    type: String,
    enum: ["free", "platinum", "gold"],
    default: "free",
  },
  passwordChangedAt: Date,
  code: {
    type: String,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  stripeCustomerId: {
    type: String,
    default: null,
  },

  subscriptionStatus: {
    type: String,
    enum: ["active", "canceled", "past_due", "incomplete"],
    default: "active",
  },
  lastPaymentDate: {
    type: Date,
  },
  subscriptionEndDate: {
    type: Date,
  },
  stripeSubscriptionId: {
    type: String,
  },
}, { timestamps: true });

export const userModel = mongoose.model("user", userSchema);