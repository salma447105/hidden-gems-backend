import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { createReview, deleteReviewById, getAllReviewsForGem, updateReviewById, getAllReviews } from "../repository/review.repository.js";
import { ApiFeatures } from "../utils/ApiFeatures.js";
import { AppError } from "../utils/AppError.js";
import { logActivity } from "./activity.controller.js";


// const getAllReviewsForAllGems = catchAsyncError(async (req, res) => {
//     const apifeatures = new ApiFeatures(getAllReviews(), req.query)
//         .paginate()
//         .sort()
//         .fields()
//         .filter()
//         .search();
//     const result = await apifeatures.mongooseQuery;
//     return res.status(200).send(result);    
// })


const getAllReviewsForAllGems = catchAsyncError(async (req, res, next) => {
  
  const countQuery = new ApiFeatures(getAllReviews(), req.query)
    .filter()
    .search();
    
  const totalItems = await countQuery.mongooseQuery.countDocuments();
  const apifeatures = new ApiFeatures(getAllReviews(), req.query)
    .filter()
    .search()
    .sort()
    .fields()
    .paginate();

  const result = await apifeatures.mongooseQuery;

  const totalPages = Math.ceil(totalItems / apifeatures.limit);

  return res.status(200).json({
    message: "success",
    page: apifeatures.page,
    totalItems,
    totalPages,
    result,
  });
});

const getAllReviewsByGemId = catchAsyncError(async (req, res, next) => {
    const gemId = req.params.id;
    const apifeatures = new ApiFeatures(getAllReviewsForGem(gemId), req.query)
        .paginate()
        .sort()
        .fields()
        .filter()
        .search();
    let result = await apifeatures.mongooseQuery;
    // const reviewsList = await getAllReviewsForGem(gemId);
    return res.status(200).send(result);
})

const postReview = catchAsyncError(async (req, res, next) => {
    const reviewObj = req.body;
    //check gemId exist
    const createdReview =  await createReview(reviewObj);
    logActivity(req.user.id, req.method, createdReview);
    return res.status(200).send(createdReview);
})

const deleteReview = catchAsyncError(async (req, res, next) => {
    const reviewId = req.params.id;
    const deletedReview = await deleteReviewById(reviewId);
        if(!deletedReview) {
            return next(new AppError("Review not found", 404));
        }
        logActivity(req.user.id, req.method, deleteReview);
        return res.status(200).send(deletedReview);
})

const updateReview = catchAsyncError(async (req, res, next) => {
    const reviewId = req.params.id;
    const updatedReview = req.body;
    const withUpdatesReview = await updateReviewById(reviewId, updatedReview);
    if(!withUpdatesReview) {
        return next(new AppError("Review can not be found", 404));
    }
    logActivity(req.user.id, req.method, withUpdatesReview);
    return res.status(201).send(withUpdatesReview);
})

export {getAllReviewsForAllGems, getAllReviewsByGemId, postReview, deleteReview, updateReview}