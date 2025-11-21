import { sendEmail } from "../emails/user.email.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { getAllActivitiesForUser, createActivityForUser, deleteActivityById} from "../repository/activity.repository.js";
import { ApiFeatures } from "../utils/ApiFeatures.js";
import { AppError } from "../utils/AppError.js";

const getAllActivities = catchAsyncError(async (req, res) => {
    const userId = req.params.id;
    //check user exist
    const features = new ApiFeatures(getAllActivitiesForUser(userId), req.query)
        .paginate()
        .sort()
        .fields()
        .filter()
        .search();    
    const result = features.mongooseQuery;
    // const activityList = await getAllActivitiesForUser(userId);
    return res.status(200).send(result);
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

const logActivity = async (user, activityText, activityDescription, sendMail=false) => {
    try {
        const activity = {
            userId: user._id,
            text: activityText, 
            description: activityDescription
        }
        await createActivityForUser(activity);
        sendMail ? sendEmail(user.email, activityText, "<p>" + activityDescription + "</p>") 
            : null; 
    } catch (error) {
        console.error("creating activity failed:", error.message);
    }
};
export {getAllActivities, postActivity, deleteActivity, logActivity}