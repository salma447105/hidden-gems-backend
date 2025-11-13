
import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { validation } from "../middleware/validation.js";
import { signInSchema, signUpSchema } from "../validation/auth.validation.js";
import { uploadSingleFile } from "../middleware/fileUpload.js";
const authRouter=express.Router();


authRouter.route('/signUp').post(uploadSingleFile("image","user"),validation(signUpSchema),authController.signUp)
authRouter.route('/signIn').post(validation(signInSchema),authController.signIn)
authRouter.route('/verify/:token').post(authController.VerifyUser)
authRouter.route('/logout').post(authController.logout)
authRouter.route('/forgetPassword').post(authController.forgetPassword)
authRouter.route('/resetPassword').post(authController.resetPassword)




export default authRouter;