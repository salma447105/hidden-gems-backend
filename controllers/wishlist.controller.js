import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { AppError } from "../utils/AppError.js";
import { ApiFeatures } from "../utils/ApiFeatures.js";
import {getUserWishlist,getWishlistItem,getWishlistCount,createWishlistItem,deleteWishlistItem,getWishlistForAdmin,clearWishlist} from "../repository/wishlist.repo.js";
import { getGem } from "../repository/gem.repo.js"; 

// for frontend user's use (with pagination, ...)
const getUserAllWishlist = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;

  const countQuery = new ApiFeatures(getUserWishlist(userId), req.query);
  const totalItems = await countQuery.mongooseQuery.countDocuments();

  const apiFeatures = new ApiFeatures(getUserWishlist(userId), req.query)
    .sort()
    .fields()
    .paginate();

  const result = await apiFeatures.mongooseQuery


  const totalPages = Math.ceil(totalItems / apiFeatures.limit);

  return res.status(200).json({
    message: "success",
    page: apiFeatures.page,
    totalItems,
    totalPages,
    userWishList:result,
  });
});

const addToWishlist = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const { gemId } = req.body;

  const gem = await getGem(gemId);
  if (!gem) {
    return next(new AppError("Gem not found", 404));
  }

  const existingInWishlist = await getWishlistItem(userId, gemId);
  if (existingInWishlist) {
    return next(new AppError("Gem already in wishlist", 400));
  }

  const result = await createWishlistItem(userId, gemId);
  
  //get from database direct
  const count = await getWishlistCount(userId);

  res.status(201).json({
    message: "Added to wishlist successfully",
    result,
    count,
  });
});

const removeFromWishlist = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const { gemId } = req.params;

  const existingInWishlist = await getWishlistItem(userId, gemId);
  if (!existingInWishlist) {
    return next(new AppError("Item not found in wishlist", 404));
  }

  await deleteWishlistItem(userId, gemId);

  //get from database direct
  const count = await getWishlistCount(userId);

  res.status(200).json({
    message: "Removed from wishlist successfully",
    count,
  });
});

const getWishlistCounter = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const count = await getWishlistCount(userId);

  res.status(200).json({
    message: "success",
    count,
  });
});

const clearAllWishlist = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;

  const result = await clearWishlist(userId);

  res.status(200).json({
    message: "Wishlist cleared successfully",
    deletedCount: result.deletedCount,
  });
});

//for Admin's use
const getUserWishlistForAdmin = catchAsyncError(async (req, res, next) => {
  const userId = req.params.userId;

  const result = await getWishlistForAdmin(userId);

  res.status(200).json({
    message: "success",
    userWishList: result,
  });
});

export {
  getUserAllWishlist,
  addToWishlist,
  removeFromWishlist,
  getWishlistCounter,
  clearAllWishlist,
  getUserWishlistForAdmin,
};
