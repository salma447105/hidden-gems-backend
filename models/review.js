import mongoose, { Mongoose } from "mongoose";
const reviewSchem = new mongoose.Schema({
    createdBy: {
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
    imgages: {
        type: [String],
    }
})

export const reviewModel = mongoose.model("review", reviewSchem)