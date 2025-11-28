
import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
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
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "reviewed", "resolved", "rejected"],
    default: "pending",
  },
  adminNotes: {
    type: String,
    default: "",
  },
  adminReplies: [
    {
      message: {
        type: String,
        required: true,
      },
      repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
      repliedAt: {
        type: Date,
        default: Date.now,
      },
      sentEmail: {
        type: Boolean,
        default: false,
      },
    },
  ],
}
  ,{ timestamps: true }
);


export const contactModel = mongoose.model("contact", contactSchema);
