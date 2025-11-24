import Joi from "joi";

export const ratingSchema = Joi.object({
     gem: Joi.string().hex().length(24).required().messages({
     'string.hex': 'Gem ID must be a valid MongoDB ObjectId',
     'string.length': 'Gem ID must be 24 characters long'
  }),rating: Joi.number().min(1).max(5).required().messages({
     "number.min": "Rating must be at least 1",
     "number.max": "Rating cannot exceed 5",
  }),
});


export const ratingUpdateSchema = Joi.object({
     gem: Joi.string().hex().length(24).optional().messages({
     'string.hex': 'Gem ID must be a valid MongoDB ObjectId',
     'string.length': 'Gem ID must be 24 characters long'
  }),rating: Joi.number().min(1).max(5).optional().messages({
       "number.min": "Rating must be at least 1",
       "number.max": "Rating cannot exceed 5",  
  })
});