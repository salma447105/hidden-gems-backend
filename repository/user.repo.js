import mongoose from "mongoose";
import { userModel } from "../models/user.js";
export const getUserById = async (userId) => {
    return await userModel.findById(userId);
}

