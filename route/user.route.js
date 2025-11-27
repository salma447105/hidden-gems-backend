
import express from "express";
import * as userController from "../controllers/user.controller.js";
import { allowedTo, protectedRoutes } from "../controllers/auth.controller.js";
import { validation } from "../middleware/validation.js";
import { signInSchema, signUpSchema, updateSchema } from "../validation/auth.validation.js";
import { uploadSingleFile } from "../middleware/fileUpload.js";
const userRouter=express.Router();


userRouter.route('/')
.post(protectedRoutes,allowedTo('admin'),uploadSingleFile("image","user"),validation(signUpSchema),userController.createUser)
.get(protectedRoutes,allowedTo('admin'),userController.getAllUsers)



userRouter.route('/:id')
.get(protectedRoutes,userController.getUser)
.delete(protectedRoutes,userController.deleteUser)
.put(protectedRoutes,uploadSingleFile("image","user"),validation(updateSchema),userController.updateUser)





export default userRouter;