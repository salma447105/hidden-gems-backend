import express from "express";
import {
  createGem,
  deleteGem,
  getAllGems,
  getGemById,
  updateGem,
} from "../controllers/gem.controller.js";
import { uploadMultipleFile } from "../middleware/fileUpload.js";
import { validation } from "../middleware/validation.js";
import { gemSchema, gemUpdateSchema } from "../validation/gem.validation.js";
import { allowedTo, protectedRoutes } from "../controllers/auth.controller.js";

const gemRouter = express.Router();
let filedsArray=[ { name: 'images', maxCount: 10 }]

gemRouter.route("/")
    .post(protectedRoutes,allowedTo("admin"), uploadMultipleFile(filedsArray, "gem"), validation(gemSchema), createGem)
    .get(getAllGems);
    

gemRouter
  .route("/:id")
  .get(getGemById)
  .delete(protectedRoutes, allowedTo("admin, owner"), deleteGem)
  .put(
    protectedRoutes,
    allowedTo("admin"),
    uploadMultipleFile(filedsArray, "gem"),
    validation(gemUpdateSchema),
    updateGem
  );

export default gemRouter;         