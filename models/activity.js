import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: "User",
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

export const activityModel = mongoose.model("Activity", activitySchema);