// import { catchAsyncError } from "../middleware/catchAsyncError.js";
// import { AppError } from "../utils/AppError.js";
// import { getRatings, getRating, createTheRating, updateTheRating, deleteTheRating, findRatingByNumber, findRatingByGemId } from "../repository/rating.repo.js";

// const getAllRatings = catchAsyncError(async (req, res, next) => {
//     let result = await getRatings();
//     res.status(200).json({ message: "success", result });
// });

// const getRatingById = catchAsyncError(async (req, res, next) => {
//     const { id } = req.params;
//     let result = await getRating(id);
//     if (!result) return next(new AppError(`Rating not found`, 404));
//     res.status(200).json({ message: "success", result });
// });

// const createRating = catchAsyncError(async (req, res, next) => {
    
//     let isExist = await findRatingByNumber(req.body.number);
//     if (isExist) return next(new AppError(`Rating already exists`, 400));

//     let isGemExist = await findRatingByGemId(req.body.gem);
//     if (!isGemExist) return next(new AppError(`Gem not found`, 404));

//     let result = await createTheRating(req.body);
//     res.status(200).json({ message: "Rating created successfully", result });
// });

// const updateRating = catchAsyncError(async (req, res, next) => {
//     const { id } = req.params;
//     let result = await getRating(id);
//     if (!result) return next(new AppError(`Rating not found`, 404));

//     if (
//         req.user.role !== "admin" &&
//         req.user._id.toString() !== result.createdBy.toString()
//     ) {
//         return next(new AppError(`You are not allowed to update this rating`, 403));
//     }

//     result = await updateTheRating(id, req.body);
//     res.status(200).json({ message: "Rating updated successfully", result });
// });

// const deleteRating = catchAsyncError(async (req, res, next) => {
//     const { id } = req.params;
//     let result = await getRating(id);
//     if (!result) return next(new AppError(`Rating not found`, 404));

//     if (
//         req.user.role !== "admin" &&
//         req.user._id.toString() !== result.createdBy.toString()
//     ) {
//         return next(new AppError(`You are not allowed to delete this rating`, 403));
//     }

//     result = await deleteTheRating(id);
//     res.status(200).json({ message: "Rating deleted successfully", result });
// });

// export { getAllRatings, getRatingById, createRating, updateRating, deleteRating };