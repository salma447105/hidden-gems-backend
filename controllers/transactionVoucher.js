import { catchAsyncError } from "../middleware/catchAsyncError";
import { ApiFeatures } from "../utils/ApiFeatures";
import * as repository from "../repository/transactionVocuher.repository";
const getAllTransActionForUser = catchAsyncError(async (req, res, next) => {
    const id = req.user._id;
    const apifeatures = new ApiFeatures(repository.getAllTransactionsByIdQuery(id), req.query);
})