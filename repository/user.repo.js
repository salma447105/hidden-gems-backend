import mongoose from "mongoose";
import { userModel } from "../models/user";
export const getUserById = async (userId) => {
    return await userModel.findById(userId);
}

