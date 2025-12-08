import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { uploadToCloudinary } from "../middleware/cloudinaryConfig.js";
import { getGem } from "../repository/gem.repo.js";
import { getRatingNumberByReviewId } from "../repository/rating.repo.js";
import {
  createReview,
  deleteReviewById,
  getAllReviewsForGem,
  updateReviewById,
  getAllReviews,
  getReviewByAuthorId,
} from "../repository/review.repository.js";
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

const getReviewByUserId = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const userPost = await getReviewByAuthorId(userId);
  if(!userPost._id) {
    return next(new AppError("Review not found.", 404));
  }
  return res.status(200).send(userPost);
})
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
  for (let review of result) {
    review.rating = await getRatingNumberByReviewId(review._id);
    //  console.log(review.rating);
  }
  // const reviewsList = await getAllReviewsForGem(gemId);
  return res.status(200).send(result);
});

const postReview = catchAsyncError(async (req, res, next) => {
  const reviewObj = req.body;
  const userId = req.user._id;
  const isExist = await getReviewByAuthorId(userId);
  if(isExist) {
    return next(new AppError("User already has a review.", 400));
  }
  let images = [];

  if (req.files?.images?.length) {
    for (const file of req.files.images) {
      const result = await uploadToCloudinary(file.buffer, "reviews");
      images.push(result.secure_url);
    }
  }

  reviewObj.images = images;
  reviewObj.userId = userId;
  //check gemId exist
  const createdReview = await createReview(reviewObj);
  logActivity(
    req.user,
    "user posted a review",
    "user created a review with " + createdReview.description,
    false
  );
  return res.status(200).send(createdReview);
});

const deleteReview = catchAsyncError(async (req, res, next) => {
  const reviewId = req.params.id;
  const deletedReview = await deleteReviewById(reviewId);
  if (!deletedReview) {
    return next(new AppError("Review not found", 404));
  }
  const gem = await getGem(deletedReview.gemId);
  const gemTitle = gem.name;
  logActivity(
    req.user,
    "user deleted a review",
    "user deleted a review on " + gemTitle,
    false
  );
  return res.status(200).send(deletedReview);
});

const updateReview = catchAsyncError(async (req, res, next) => {
  const reviewId = req.params.id;
  const updatedReview = req.body;
  const withUpdatesReview = await updateReviewById(reviewId, updatedReview);
  if (!withUpdatesReview) {
    return next(new AppError("Review can not be found", 404));
  }
  logActivity(
    req.user,
    "user deleted a review",
    "user deleted a review with " + withUpdatesReview.description,
    false
  );
  return res.status(201).send(withUpdatesReview);
});

export {
  getAllReviewsForAllGems,
  getAllReviewsByGemId,
  postReview,
  deleteReview,
  updateReview,
  getReviewByUserId
};
