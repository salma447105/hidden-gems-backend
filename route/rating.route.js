import express from "express";
import {
  getRatingById,
  getAllGemRatings,
  getAllUserRatings,
  getUserRatingForGem,
  getGemAvgRating,
  createRating,
  updateRating,
  deleteRating,
} from "../controllers/rating.controller.js";
import { validation } from "../middleware/validation.js";
import { ratingSchema, ratingUpdateSchema } from "../validation/rating.validation.js";
import { protectedRoutes } from "../controllers/auth.controller.js";

const ratingRouter = express.Router();

ratingRouter.route("/")
  .post(protectedRoutes, validation(ratingSchema), createRating);

ratingRouter.route("/:id")
  .get(protectedRoutes, getRatingById)
  .put(protectedRoutes, validation(ratingUpdateSchema), updateRating)
  .delete(protectedRoutes, deleteRating);

ratingRouter.route("/gem/:gemId")
  .get(getAllGemRatings);

ratingRouter.route("/user/:userId")
  .get(protectedRoutes, getAllUserRatings);

ratingRouter.route("/gem/:gemId/avg")
  .get(protectedRoutes, getGemAvgRating);

ratingRouter.route("/user/:id/gem/:gemId")
  .get(protectedRoutes, getUserRatingForGem);

ratingRouter.route("/my/ratings")
  .get(protectedRoutes, getAllUserRatings);

export default ratingRouter;
