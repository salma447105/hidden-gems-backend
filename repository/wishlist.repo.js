import { wishlistModel } from "../models/wishlist.js";

// for frontend user's use 
const getUserWishlist = (userId) => {
    return wishlistModel.find({ userId: userId })
      .populate("gemId", "-embeddings")
  .populate("userId", "firstName lastName email");
};

const getWishlistItem = async (userId, gemId) => {
  return await wishlistModel.findOne({
    userId: userId,
    gemId: gemId,
  })  .populate("gemId", "-embeddings")
  .populate("userId", "firstName lastName email");
};

const getWishlistCount = async (userId) => {
  return await wishlistModel.countDocuments({ userId: userId })
};

const createWishlistItem = async (userId, gemId) => {
  return await wishlistModel.create({
    userId: userId,
    gemId: gemId,
  });
};

const deleteWishlistItem = async (userId, gemId) => {
  return await wishlistModel.findOneAndDelete({
    userId: userId,
    gemId: gemId,
  });
};

// for Admin's use
const getWishlistForAdmin = async (userId) => {
  return await wishlistModel
    .find({ userId: userId })
    .populate("gemId", "-embeddings")
    .populate("userId", "firstName lastName email");
};

const clearWishlist = async (userId) => {
  return await wishlistModel.deleteMany({ userId: userId });
}

export {
  getUserWishlist,
  getWishlistItem,
  getWishlistCount,
  createWishlistItem,
  deleteWishlistItem,
  getWishlistForAdmin,
  clearWishlist,
};
