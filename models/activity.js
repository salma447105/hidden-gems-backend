import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: "user",
        required: true
    },
    text: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
})

export const activityModel = mongoose.model("activity", activitySchema);