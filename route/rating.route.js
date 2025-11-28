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

// ratingRouter.use(protectedRoutes);

ratingRouter.route("/")
    .post(validation(ratingSchema), createRating);

ratingRouter.route("/:id")
    .get(getRatingById)
    .put(validation(ratingUpdateSchema), updateRating)
    .delete(deleteRating);

ratingRouter.route("/gem/:gemId")
    .get(getAllGemRatings)

ratingRouter.route("/user/:userId")
    .get(getAllUserRatings)

ratingRouter.route("/gem/:gemId/avg")    
    .get(getGemAvgRating)    

ratingRouter.route("/user/:id/gem/:gemId")
    .get( getUserRatingForGem);

ratingRouter.route("/my/ratings")
    .get(getAllUserRatings);
    
    
export default ratingRouter;