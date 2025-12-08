import mongoose from "mongoose";
import { reviewModel } from "../models/review.js";


export const createReview = async (review) => {
    return (await reviewModel.create(review))
        .populate({path: "userId", select: "firstName lastName"});
}

export const getAllReviews = () => {
    return reviewModel.find().populate({path: "userId", select: "firstName lastName"});
}

export const getReviewByAuthorId = async (id) => {
    return reviewModel.findOne({userId: id});
}

export const getAllReviewsForGem = (gemId) => {
    return reviewModel.find({gemId: gemId})
        .populate({path: "userId", select: "firstName lastName"});
}

export const deleteReviewById = async (id) => {
    return await reviewModel.findByIdAndDelete(id);
}

export const updateReviewById = async (id, updatedFields) => {
    return await reviewModel.findByIdAndUpdate(id,  {$set: updatedFields }, {new: true});
}

