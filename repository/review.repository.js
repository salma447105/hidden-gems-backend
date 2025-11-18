import mongoose from "mongoose";
import { reviewModel } from "../models/review.js";

export const createReview = async (review) => {
    return await reviewModel.create(review);
}

export const getAllReviewsForGem = (gemId) => {
    return reviewModel.find({gemId: gemId});
}

export const deleteReviewById = async (id) => {
    return await reviewModel.findByIdAndDelete(id);
}

export const updateReviewById = async (id, updatedFields) => {
    return await reviewModel.findByIdAndUpdate(id,  {$set: updatedFields }, {new: true});
}

