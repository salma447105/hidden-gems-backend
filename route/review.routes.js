import express from "express";
import * as reviewController from "../controllers/review.controller.js";
import { protectedRoutes } from "../controllers/auth.controller.js";
import {  uploadMultipleFiles } from "../middleware/fileUpload.js";
const router = express.Router();

//get all reviews for a place
router.get("/:id", reviewController.getAllReviewsByGemId);
router.get("/", reviewController.getAllReviewsForAllGems);
router.post("/",protectedRoutes, uploadMultipleFiles([
    { name: "images", maxCount: 4 }
  ]), reviewController.postReview);
router.delete("/:id",protectedRoutes,  reviewController.deleteReview);
router.patch("/:id" ,protectedRoutes , reviewController.updateReview);

export default router;