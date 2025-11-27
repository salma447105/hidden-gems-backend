

import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { userModel } from "../models/user.js";
import { AppError } from "../utils/AppError.js";

import { ApiFeatures } from "../utils/ApiFeatures.js";
import { categoryModel } from "../models/category.js";

const createCategory = catchAsyncError(async (req, res, next) => {
  let isExist = await categoryModel.findOne({ categoryName: req.body.categoryName });
  if (isExist) return next(new AppError(`Category already exists`, 400));

 

  let result = new categoryModel({
    categoryName: req.body.categoryName,
    categoryImage: req.file?.filename,
    createdBy: req.user._id,
  });

  await result.save();

  res.status(200).json({
    message: "Category Created successfully.",
    result,
  });
});

const getCategory = catchAsyncError(async (req, res, next) => {
  let result = await categoryModel.findById(req.params.id).populate('createdBy', 'firstName lastName email');

  if (!result) return next(new AppError(`isExist not found`, 404));


  res.status(200).json({
    message: "Success",
    result,
  });
});

const getAllCategories = catchAsyncError(async (req, res, next) => {

  const countQuery = new ApiFeatures(categoryModel.find({}), req.query)
    .filter()
    .search();

  const totalItems = await countQuery.mongooseQuery.countDocuments();

  const apifeatures = new ApiFeatures(categoryModel.find({}), req.query)
    .filter()
    .search()
    .sort()
    .fields()
    .paginate();

  const result = await apifeatures.mongooseQuery.populate('createdBy', 'firstName lastName email');

  const totalPages = Math.ceil(totalItems / apifeatures.limit);
console.log(result);

  res.status(200).json({
    message: "success",
    page: apifeatures.page,
    totalItems,
    totalPages,
    result,
  });
});

const updateCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let category = await categoryModel.findById(id);
  if (!category) return next(new AppError("Category not found", 404));

  if (req.body.categoryName) {
    category.categoryName = req.body.categoryName;
  }

  if (req.file?.filename) {
    category.categoryImage = req.file.filename;
  }

  await category.save();

  return res.status(200).json({
    message: "success",
    category,
  });
});


const deleteCategory = catchAsyncError(
    async (req, res, next) => {
        const { id } = req.params
        let result = await categoryModel.findByIdAndDelete(id)

        !result && next(new AppError(`category not found`, 404))
        result && res.status(200).json({ message: "success", result })
    }
)

export { createCategory, getCategory, getAllCategories, deleteCategory, updateCategory };
