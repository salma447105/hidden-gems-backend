import {activityModel} from "../models/activity.js";
import mongoose from "mongoose";



export const getAllActivitiesForUser = (userId) => {
    return activityModel.find({ userId });
}

export const createActivityForUser = async (activity)=> {
    return await activityModel.create(activity);
}

export const deleteActivityById = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid activity ID");
    }
    return await activityModel.findByIdAndDelete(id);
}