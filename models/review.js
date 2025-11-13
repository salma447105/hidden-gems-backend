import mongoose, { Mongoose } from "mongoose";
const reviewSchem = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "user" 
    },
    description: {
        type: String,
        required: true
    },
    gemId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "gem"
    },
    images: {
        type: [String],
    }
})

export const reviewModel = mongoose.model("review", reviewSchem)