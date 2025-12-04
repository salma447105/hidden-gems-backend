import express from 'express';
const router = express.Router();
import * as activityController from '../controllers/activity.controller.js'
import { validation } from '../middleware/validation.js';
import { idParamSchema } from '../validation/auth.validation.js';
import { protectedRoutes } from '../controllers/auth.controller.js';
router.get("/",protectedRoutes, activityController.getAllActivities);
// router.post("/", activityController.postActivity);
router.delete('/:activityId',protectedRoutes, activityController.deleteActivity);
export default router;
