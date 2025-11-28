
import Joi from "joi";

export const contactSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  message: Joi.string().min(10).max(2000).required(),
});

export const contactUpdateSchema = Joi.object({
  status: Joi.string().valid("pending", "reviewed", "resolved", "rejected").optional(),
  adminNotes: Joi.string().max(500).optional().allow(""),
});


export const contactReplySchema = Joi.object({
  message: Joi.string().min(5).max(1000).required(),
  sentEmail: Joi.boolean().default(true),
});

