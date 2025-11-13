import mongoose from "mongoose";


const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true
    },
    categoryImage: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: "user",
        required: true
    }
})

export const categoryModel = mongoose.model("category", categorySchema);
