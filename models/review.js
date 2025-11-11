import mongoose, { Mongoose } from "mongoose";
const reviewSchem = new mongoose.Schema({
    createdBy: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User" 
    },
    description: {
        type: String,
        required: true
    },
    gemId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Gem"
    },
    imgages: {
        type: [String],
    }
})

export const reviewModel = mongoose.model("Review", reviewSchem)