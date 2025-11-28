import Joi from "joi";

export const gemSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  gemLocation: Joi.string().required(),
  description: Joi.string().min(10).required(),
  category: Joi.string().hex().length(24).required(),
  discount: Joi.number().min(0).max(100).optional(),
  discountGold: Joi.number().min(0).max(90).optional(),
  discountPlatinum: Joi.number().min(0).max(100).optional(),
  status: Joi.string().valid("pending", "rejected", "accepted").optional(),
  avgRating: Joi.number().min(0).max(5).optional(),
  isSubscribed: Joi.boolean().optional(),
});


export const gemUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  oldImages: Joi.array().items(Joi.string()).optional(),   
  gemLocation: Joi.string().optional(),
  description: Joi.string().min(10).optional(),
  category: Joi.string().hex().length(24).optional(),
  discount: Joi.number().min(0).max(100).optional(),
  discountGold: Joi.number().min(0).max(90).optional(), 
  discountPlatinum: Joi.number().min(0).max(100).optional(),
  status: Joi.string().valid("pending", "rejected", "accepted").optional(),
  avgRating: Joi.number().min(0).max(5).optional(),
  isSubscribed: Joi.boolean().optional(),
});



