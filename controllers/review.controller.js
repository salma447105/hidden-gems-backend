import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { createReview, deleteReviewById, getAllReviewsForGem, updateReviewById } from "../repository/review.repository.js";
import { AppError } from "../utils/AppError.js";

const getAllReviews = catchAsyncError(async (req, res, next) => {
    const gemId = req.params.id;
    const reviewsList = await getAllReviewsForGem(gemId);
    console.log(reviewsList);
    return res.status(200).send(reviewsList);
})

const postReview = catchAsyncError(async (req, res, next) => {
    const reviewObj = req.body;
    //check gemId exist
    const createdReview =  await createReview(reviewObj);
    return res.status(200).send(createdReview);
})

const deleteReview = catchAsyncError(async (req, res, next) => {
    const reviewId = req.params.id;
    const deletedReview = await deleteReviewById(reviewId);
        if(!deletedReview) {
            return next(new AppError("Review not found", 404));
        }
        return res.status(200).send(deletedReview);
})

const updateReview = catchAsyncError(async (req, res, next) => {
    const reviewId = req.params.id;
    const updatedReview = req.body;
    const withUpdatesReview = await updateReviewById(reviewId, updatedReview);
    if(!withUpdatesReview) {
        return next(new AppError("Review can not be found", 404));
    }
    return res.status(201).send(withUpdatesReview);
})

export {getAllReviews, postReview, deleteReview, updateReview}