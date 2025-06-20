const { z } = require('zod');

const yesNoToBool = z.union([
  z.boolean(),
  z.string().toLowerCase().transform(val => val === 'yes')
]);
// Zod schemas for validation
const userCreateSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must not exceed 50 characters")
    .trim(),

  email: z.string()
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),

  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password must not exceed 100 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"),

  phone: z.string()
    .regex(/^\+?[\d\s-()]+$/, "Please provide a valid phone number")
    .optional(),

  age: z.number()
    .int("Age must be a whole number")
    .min(13, "You must be at least 13 years old")
    .max(120, "Please provide a valid age")
    .optional()
});

const userLoginSchema = z.object({
  email: z.string()
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),

  password: z.string()
    .min(1, "Password is required")
});

// Fixed OTP validation schema
const otpVerifySchema = z.object({
  email: z
    .string()
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),
  otp: z
    .string()
    .length(4, "OTP must be exactly 4 digits"),
});

const validateSchema = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errorMessages
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error during validation"
      });
    }
  };
};


const questionnaireSchema = z.object({
  fullName: z.string().min(2).max(100).trim(),
  age: z.number().int().min(1).max(120),
  gender: z.enum(['Male', 'Female', 'Other']),
  contactNumber: z.string().min(7).max(15),

  allergy: z.string().max(200).optional().nullable(),
  currentMedication: z.string().max(200).optional().nullable(),

  diabetes: yesNoToBool,
  hypertension: yesNoToBool,
  smoke: yesNoToBool,
  drink: yesNoToBool,

  weight: z.number().min(1).max(500),
  height: z.number().min(30).max(300),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
  heartDisease: yesNoToBool,
  asthma: yesNoToBool,
  anySurgeryHistory: z.string().max(200).optional().nullable(),
  exerciseRegularly: yesNoToBool,
  dietType: z.enum(['Vegetarian', 'Non-vegetarian', 'Vegan']),
  sleepHours: z.number().min(1).max(24),
  mentalHealth: z.string().max(100)
});

module.exports = {
  userCreateSchema,
  userLoginSchema,
  otpVerifySchema,
  questionnaireSchema,
  validateSchema
};