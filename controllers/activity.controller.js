import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { getAllActivitiesForUser, createActivityForUser, deleteActivityById} from "../repository/activity.repository.js";
import { AppError } from "../utils/AppError.js";

const getAllActivities = catchAsyncError(async (req, res) => {
    const userId = req.params.id;
    //check user exist
    const activityList = await getAllActivitiesForUser(userId);
    return res.status(200).send(activityList);
})

const postActivity = catchAsyncError(async (req, res) => {
    const userId = req.params.id;
    //check user exist
    const activity = req.body;

    const createdActivity = await createActivityForUser(activity);
    return res.status(201).send(createdActivity);
})

const deleteActivity = catchAsyncError(async (req, res, next) => {
    const activityId = req.params.id;
    const deletedActivity = await deleteActivityById(activityId);
    if(!deletedActivity) {
        return next(new AppError("Activity not found", 404));
    }
    return res.status(200).send(deletedActivity);
})
export {getAllActivities, postActivity, deleteActivity}