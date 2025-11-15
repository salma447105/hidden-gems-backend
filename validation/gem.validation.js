import Joi from "joi";

export const gemSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  gemLocation: Joi.string().required(),
  description: Joi.string().min(10).required(),
  category: Joi.string().hex().length(24).required(), 
  discount: Joi.number().min(0).max(100).optional(),
  discoountPremium: Joi.number().min(0).max(100).optional(),
});

//still need to update gem validations