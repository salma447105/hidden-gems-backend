import express from "express";
import {
  createGem,
  deleteGem,
  getAllGems,
  getGemById,
  updateGem,
  getAllGemsForCategory,
  getAllGemsForUser,
  changeGemStatus,
  getAllSubscribedGems,
} from "../controllers/gem.controller.js";
import { uploadMultipleFiles } from "../middleware/fileUpload.js";
import { validation } from "../middleware/validation.js";
import { gemSchema, gemUpdateSchema } from "../validation/gem.validation.js";
import { allowedTo, protectedRoutes } from "../controllers/auth.controller.js";

const gemRouter = express.Router();
let filedsArray = [{ name: "images", maxCount: 10 }];

gemRouter.route("/category/:categoryId").get(getAllGemsForCategory);
gemRouter.route("/user/:userId").get(protectedRoutes, getAllGemsForUser);
gemRouter
  .route("/:gemId/status")
  .put(protectedRoutes, allowedTo("admin"), changeGemStatus);

gemRouter
  .route("/")
  .post(
    protectedRoutes,
    uploadMultipleFiles(filedsArray),
    validation(gemSchema),
    createGem
  )
  .get(getAllGems);


  gemRouter
  .route("/subscribed")
  .get(getAllSubscribedGems);
gemRouter
  .route("/:id")
  .get(getGemById)
  .delete(protectedRoutes, deleteGem) //, allowedTo("admin")
  .put(
    protectedRoutes,
    uploadMultipleFiles(filedsArray),
    validation(gemUpdateSchema),
    updateGem
  );

export default gemRouter;
