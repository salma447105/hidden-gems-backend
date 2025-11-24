import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { AppError } from "../utils/AppError.js";
import {
  getTheRating,
  getTheGemRatings,
  getUserRatings,
  getTheUserRatingForGem,
  getTheGemAvgRating,
  createTheRating,
  updateTheRating,
  deleteTheRating,
  updateGemAvgRating,
} from "../repository/rating.repo.js";

//for Admin's Use
const getRatingById = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    let rating =  await getTheRating(id);
    if(!rating){
        return next(new AppError("Rating not found", 404));
    }
    return res.status(200).json({ message: "success", rating });
})

//for Admin's & User's Use
const getAllGemRatings = catchAsyncError(async (req, res, next) => {
    const { gemId } = req.params;
    let ratings = await getTheGemRatings(gemId);
    // 
    return res
      .status(200)
      .json({
        message: ratings.length === 0 ? "this gem has no ratings yet" : "success",
        ratings,
      });
})

// (may be) for Admin's Use 
const getAllUserRatings = catchAsyncError(async (req, res, next) => {
    let userId = req.params.userId;
    
    if (!userId && req.user) {
      userId = req.user._id;
    }

    if (
       req.user.role !== "admin" &&
       req.user._id.toString() !== userId.toString()
     ) {
       return next(new AppError("You can only view your own ratings", 403));
     }

    let ratings = await getUserRatings(userId);

    return res.status(200).json({
      message:ratings.length === 0 ? "No ratings found for this user" : "success",
      ratings,
    });
})

// for Admin's & User's Use
const getUserRatingForGem = catchAsyncError(async (req, res, next) => {
    const { id, gemId } = req.params;
    let rating = await getTheUserRatingForGem(id, gemId);
    console.log("rating:", rating);
    return res
      .status(200)
      .json({
        message: rating ? "success" : "No rating found for this user and gem",
        rating: rating || null
      });
})

// for Admin's & User's Use
const getGemAvgRating = catchAsyncError(async (req, res, next) => {
    const { gemId } = req.params;
    let avgRatingData = await getTheGemAvgRating(gemId);
    console.log("avgRatingData:", avgRatingData);


    return res.status(200).json({
        message: avgRatingData.totalRatings === 0 ? "No ratings yet" : "success",
        avgRatingData
    });
})

// mainly for User's Use 
const createRating = catchAsyncError(async (req, res, next) => {
    console.log("req.body:", req.body); 
    console.log("req.user:", req.user);
    
    let isExist = await getTheUserRatingForGem(req.user._id, req.body.gem);
    if(isExist){
        return next(new AppError("You have already rated this gem", 400));
    }

    const ratingData = {
      gem: req.body.gem, 
      rating: req.body.rating,
      createdBy: req.user._id,
    };
    const rating = await createTheRating(ratingData);

    await updateGemAvgRating(req.body.gem);
    return res.status(200).json({ message: "Rating created successfully", rating });

});

// mainly for User's Use
const updateRating = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    let rating = await getTheRating(id);
    if(!rating){
        return next(new AppError("Rating not found", 404));
    }

    if(rating.createdBy.toString() !== req.user._id.toString()){
        return next(new AppError("You are not allowed to update this rating", 403));
    }

    const ratingData = req.body;
    const updatedRating = await updateTheRating(id, ratingData);
    await updateGemAvgRating(rating.gem);
    return res.status(200).json({ message: "Rating updated successfully", updatedRating });
});

// mainly for User's Use
const deleteRating = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    let rating = await getTheRating(id);
    if(!rating){
        return next(new AppError("Rating not found", 404));
    }

    if(rating.createdBy.toString() !== req.user._id.toString()){
        return next(new AppError("You are not allowed to delete this rating", 403));
    }

    const deletedRating = await deleteTheRating(id);
    await updateGemAvgRating(rating.gem);
    return res.status(200).json({ message: "Rating deleted successfully", deletedRating });
    
});

export {  getRatingById,getAllGemRatings,getAllUserRatings,getUserRatingForGem,getGemAvgRating, createRating, updateRating, deleteRating };