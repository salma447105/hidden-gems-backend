import Joi from "joi";

export const signUpSchema = Joi.object({
  firstName: Joi.string().min(3).max(30).required(),
  lastName: Joi.string().min(3).max(30).required(),

  phoneNumber: Joi.string()
    .pattern(/^01[0-2,5][0-9]{8}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must be a valid Egyptian number (e.g. 01012345678).",
      "string.empty": "Phone number is required.",
    }),

  email: Joi.string()
    .email({ tlds: { allow: ["com", "net", "org", "edu", "eg"] } })
    .required()
    .messages({
      "string.email":
        "Please enter a valid email address (e.g. example@gmail.com).",
      "string.empty": "Email is required.",
    }),

  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
      "string.empty": "Password is required.",
    }),

  role: Joi.string().valid("user", "admin",'owner').default("user"),

  subscription: Joi.string()
    .valid("free", "gold", "platinum")
    .default("free"),

  verified: Joi.boolean().default(false),
});


export const updateSchema = Joi.object({
  firstName: Joi.string().min(3).max(30),
  lastName: Joi.string().min(3).max(30),

  phoneNumber: Joi.string()
    .pattern(/^01[0-2,5][0-9]{8}$/)
    
    .messages({
      "string.pattern.base":
        "Phone number must be a valid Egyptian number (e.g. 01012345678).",
      "string.empty": "Phone number is required.",
    }),

  email: Joi.string()
    .email({ tlds: { allow: ["com", "net", "org", "edu", "eg"] } })
    
    .messages({
      "string.email":
        "Please enter a valid email address (e.g. example@gmail.com).",
      "string.empty": "Email is required.",
    }),

  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)
    
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
      "string.empty": "Password is required.",
    }),

  role: Joi.string().valid("user", "admin",'owner').default("user"),

  subscription: Joi.string()
    .valid("free", "gold", "platinum")
    .default("free"),

  verified: Joi.boolean().default(false),
});
export const signInSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: ["com", "net", "org", "edu", "eg"] } })
    .required()
    .messages({
      "string.email": "Please enter a valid email address.",
      "string.empty": "Email is required.",
    }),

  password: Joi.string().required().messages({
    "string.empty": "Password is required.",
  }),
});

export const idParamSchema = Joi.object({
    id: Joi.string().required().hex().length(24)
});