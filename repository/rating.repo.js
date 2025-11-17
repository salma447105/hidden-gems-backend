// import { ratingModel } from "../models/rating.js";
// import { gemModel } from "../models/gem.js";

// const getRatings = async () => {
//     return await ratingModel.find();
// };

// const getRating = async (id) => {
//     return await ratingModel.findById(id);
// };

// const createTheRating = async (data) => {
//     return await ratingModel.create(data);
// };

// const updateTheRating = async (id, updatedFields) => {
//     return await ratingModel.findByIdAndUpdate(id,  updatedFields , {new: true});
// };

// const deleteTheRating = async (id) => {
//     return await ratingModel.findByIdAndDelete(id);
// };

// const findRatingByNumber = async (rating) => {
//     return await ratingModel.findOne({ rating: rating });
// };

// const findRatingByGemId = async (gemId) => {
//     return await ratingModel.findOne({ gem: gemId });
// };

// export { getRatings, getRating, createTheRating, updateTheRating, deleteTheRating, findRatingByNumber, findRatingByGemId };