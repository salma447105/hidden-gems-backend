import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { ApiFeatures } from "../utils/ApiFeatures.js";
import { AppError } from "../utils/AppError.js";
import * as repository from "../repository/transactionVocuher.repository.js";

const getTransActionById = catchAsyncError(async (req, res, next) => {
    const {id} = req.params;
    if(!id) {
        return next(new AppError("Gem Id is required", 400));
    }
    const transactionVocuher = await repository.getTransActionById(id);
    if(!transactionVocuher) {
        return res.status(404).send({message: "Transction voucher not found"});
    }
    return res.status(200).send(transactionVocuher);
})
const getAllTransActionForUser = catchAsyncError(async (req, res, next) => {
    const id = "692c3c705e5fa2ca7926577c";
    const apifeatures = new ApiFeatures(repository.getAllTransactionsByIdQuery(id), req.query)
            .filter()
            .search()
            .sort()
            .fields()
            .paginate();
    const countQuery = new ApiFeatures(repository.getAllTransactionsByIdQuery(id), req.query)
            .filter()
            .search();

    const totalItems = await countQuery.mongooseQuery.countDocuments();
    const totalPages =  Math.ceil(totalItems / apifeatures.limit) || 0;
    const result = await apifeatures.mongooseQuery;
    res.status(200).send({
        message: "success",
        page: apifeatures.page,
        totalItems,
        totalPages,
        result,
    })        
})


const getAllTransActionsForOwner = catchAsyncError(async (req, res, next) => {
    const {gemId} = req.params;
    if(!gemId) {
        return next(new AppError("Gem id is required.", 400));
    }
    const apifeatures = new ApiFeatures(repository.getAllTransactionsByGemIdQuery(gemId), req.query)
            .filter()
            .search()
            .sort()
            .fields()
            .paginate();
    const countQuery = new ApiFeatures(repository.getAllTransactionsByGemIdQuery(gemId), req.query)
            .filter()
            .search();
    const totalItems = await countQuery.mongooseQuery.countDocuments();
    const totalPages =  Math.ceil(totalItems / apifeatures.limit);
    const result = await apifeatures.mongooseQuery;
    res.status(200).send({
        message: "success",
        page: apifeatures.page,
        totalItems,
        totalPages,
        result,
    })         
})

const getAllTransActionForAdmin = catchAsyncError(async (req, res, next) => {
    const apifeatures = new ApiFeatures(repository.getAllTransActionQuery(), req.query)
            .filter()
            .search()
            .sort()
            .fields()
            .paginate();
    const countQuery = new ApiFeatures(repository.getAllTransActionQuery(), req.query)
            .filter()
            .search();
    const totalItems = await countQuery.mongooseQuery.countDocuments();
    const totalPages =  Math.ceil(totalItems / apifeatures.limit);
    const result = await apifeatures.mongooseQuery.populate("user", "firstName lastName");
    res.status(200).send({
        message: "success",
        page: apifeatures.page,
        totalItems,
        totalPages,
        result,
    })
})
export {getAllTransActionForUser, getAllTransActionsForOwner, getAllTransActionForAdmin, getTransActionById}