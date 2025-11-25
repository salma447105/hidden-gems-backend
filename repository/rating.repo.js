import mongoose from "mongoose";
import { ratingModel } from "../models/rating.js";
import { gemModel } from "../models/gem.js";

const getTheRating = async (id) => {
  return await ratingModel.findById(id);
};

const getTheGemRatings = async (gemId) => {
  return await ratingModel.find({gem: gemId}).sort({ createdAt: -1 });
};

const getUserRatings = async (userId) => {
  return await ratingModel.find({ createdBy: userId }).sort({ createdAt: -1 });
}

const getTheUserRatingForGem = async (userId, gemId) => {
  return await ratingModel.findOne({ createdBy: userId, gem: gemId });
};

const getTheGemAvgRating = async (gemId) => {
  const result = await ratingModel.aggregate([
    { $match: { gem: new mongoose.Types.ObjectId(gemId) } },
    {
      $group: {
        _id: "$gem",
        avgRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
        ratingCounts: {
          $push: "$rating",
        },
      },
    },
  ]);
  
  return (
    result[0] || {
      avgRating: 0,
      totalRatings: 0,
      ratingCounts: [],
    }
  );
};

const updateGemAvgRating = async (gem) => {
  const result = await ratingModel.aggregate([
    { $match: { gem: new mongoose.Types.ObjectId(gem) } },
    {
      $group: {
        _id: "$gem",
        avgRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  const newAvg = result[0] ? Math.round(result[0].avgRating * 10) / 10 : 0;

  // Update the gem's average rating
  await gemModel.findByIdAndUpdate(gem, {
    avgRating: newAvg,
  });

  return newAvg;
};

const createTheRating = async (rating) => {
  return await ratingModel.create(rating);
};

const updateTheRating = async (id, updatedFields) => {
     return await ratingModel.findByIdAndUpdate(id,  updatedFields , {new: true});
};

const deleteTheRating = async (id) => {
     return await ratingModel.findByIdAndDelete(id);   
};



export {
  getTheRating,
  getTheGemRatings,
  createTheRating,
  updateTheRating,
  deleteTheRating,
  getUserRatings,
  getTheUserRatingForGem,
  getTheGemAvgRating,
  updateGemAvgRating
};
