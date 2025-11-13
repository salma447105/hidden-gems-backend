import mongoose from "mongoose";
// import { v4 as uuid } from "uuid";
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
    // match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
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
    // match:
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
    // default:()=>nanoid(10),
    // unique: true,
  },
  // qrcode: {

  // }
});

export const userModel = mongoose.model("user", userSchema);
