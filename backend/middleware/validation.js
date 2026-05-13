const Joi = require('joi');

// Validation schemas
const schemas = {
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required'
    }),
    role: Joi.string().valid('student', 'admin', 'university_partner').optional()
  }),

  register: Joi.object({
    firstName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name must not exceed 50 characters',
      'any.required': 'First name is required'
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name must not exceed 50 characters',
      'any.required': 'Last name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character',
        'any.required': 'Password is required'
      }),
    role: Joi.string().valid('student', 'admin', 'university_partner').optional(),
    adminCode: Joi.string().optional(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional().messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),
    city: Joi.string().max(100).optional(),
    selectedDestinations: Joi.array().items(Joi.string()).optional(),
    selectedDegrees: Joi.array().items(Joi.string()).optional(),
    specialization: Joi.string().max(200).optional(),
    intakeTerm: Joi.string().max(50).optional(),
    budget: Joi.string().max(50).optional()
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
  }),

  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Reset token is required'
    }),
    newPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character',
        'any.required': 'New password is required'
    })
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    countryCode: Joi.string().max(10).optional(),
    city: Joi.string().max(100).optional(),
    selectedDestinations: Joi.array().items(Joi.string()).optional(),
    selectedDegrees: Joi.array().items(Joi.string()).optional(),
    specialization: Joi.string().max(200).optional(),
    intakeTerm: Joi.string().max(50).optional(),
    budget: Joi.string().max(50).optional(),
    avatar: Joi.string().uri().optional()
  }),

  booking: Joi.object({
    preferredDate: Joi.date().iso().required().messages({
      'any.required': 'Preferred date is required'
    }),
    preferredTime: Joi.string().valid(
      '10:00 AM - 12:00 PM',
      '12:00 PM - 02:00 PM',
      '02:00 PM - 04:00 PM',
      '04:00 PM - 06:00 PM'
    ).required().messages({
      'any.required': 'Preferred time is required',
      'any.only': 'Invalid time slot selected'
    }),
    bookingType: Joi.string().valid(
      'initial_consultation',
      'application_review',
      'interview_prep',
      'career_guidance',
      'other'
    ).optional(),
    notes: Joi.string().max(500).optional()
  }),

  paymentOrder: Joi.object({
    applicationId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
      'any.required': 'Application ID is required',
      'string.pattern.base': 'Invalid Application ID format'
    }),
    amount: Joi.number().positive().required().messages({
      'any.required': 'Amount is required',
      'number.positive': 'Amount must be positive'
    }),
    currency: Joi.string().valid('INR', 'USD', 'EUR').optional()
  }),

  verifyPayment: Joi.object({
    razorpay_order_id: Joi.string().required().messages({
      'any.required': 'Razorpay order ID is required'
    }),
    razorpay_payment_id: Joi.string().required().messages({
      'any.required': 'Razorpay payment ID is required'
    }),
    razorpay_signature: Joi.string().required().messages({
      'any.required': 'Razorpay signature is required'
    }),
    paymentId: Joi.string().optional()
  }),

  application: Joi.object({
    university: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
      'any.required': 'University ID is required',
      'string.pattern.base': 'Invalid University ID format'
    }),
    course: Joi.string().required().messages({
      'any.required': 'Course name is required'
    }),
    academics: Joi.object({
      institution: Joi.string().optional(),
      degree: Joi.string().optional(),
      cgpa: Joi.string().optional(),
      passingYear: Joi.string().optional()
    }).optional(),
    testScores: Joi.object({
      gre: Joi.number().min(0).max(340).optional(),
      ielts: Joi.number().min(0).max(9).optional(),
      toefl: Joi.number().min(0).max(120).optional(),
      gate: Joi.number().min(0).max(1000).optional(),
      gmat: Joi.number().min(0).max(800).optional(),
      jee: Joi.number().min(0).max(300).optional(),
      cat: Joi.number().min(0).max(400).optional()
    }).optional(),
    source: Joi.string().optional()
  }),

  scholarship: Joi.object({
    title: Joi.string().min(5).max(200).required().messages({
      'string.min': 'Title must be at least 5 characters',
      'string.max': 'Title must not exceed 200 characters',
      'any.required': 'Title is required'
    }),
    description: Joi.string().min(10).required().messages({
      'string.min': 'Description must be at least 10 characters',
      'any.required': 'Description is required'
    }),
    provider: Joi.string().required().messages({
      'any.required': 'Provider is required'
    }),
    type: Joi.string().valid(
      'merit_based', 'need_based', 'sports', 'arts', 'community',
      'corporate', 'government', 'university_specific'
    ).required().messages({
      'any.required': 'Scholarship type is required'
    }),
    amount: Joi.number().positive().required().messages({
      'any.required': 'Amount is required',
      'number.positive': 'Amount must be positive'
    }),
    currency: Joi.string().valid('INR', 'USD', 'EUR').optional(),
    amountType: Joi.string().valid(
      'fixed', 'percentage', 'full_tuition', 'partial_tuition', 'living_expenses'
    ).optional()
  }),

  interview: Joi.object({
    applicationId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
      'any.required': 'Application ID is required',
      'string.pattern.base': 'Invalid Application ID format'
    }),
    type: Joi.string().valid(
      'technical', 'hr', 'portfolio_review', 'group_discussion',
      'video_essay', 'phone_screen', 'onsite'
    ).required().messages({
      'any.required': 'Interview type is required'
    }),
    scheduledDate: Joi.date().iso().required().messages({
      'any.required': 'Scheduled date is required'
    }),
    scheduledTime: Joi.string().required().messages({
      'any.required': 'Scheduled time is required'
    }),
    duration: Joi.number().min(15).max(180).optional().messages({
      'number.min': 'Duration must be at least 15 minutes',
      'number.max': 'Duration must not exceed 180 minutes'
    }),
    platform: Joi.string().valid(
      'zoom', 'google_meet', 'teams', 'skype', 'phone', 'onsite', 'other'
    ).required().messages({
      'any.required': 'Platform is required'
    }),
    instructions: Joi.string().max(1000).optional()
  }),

  refund: Joi.object({
    paymentId: Joi.string().required().messages({
      'any.required': 'Payment ID is required'
    }),
    refundAmount: Joi.number().positive().required().messages({
      'any.required': 'Refund amount is required',
      'number.positive': 'Refund amount must be positive'
    }),
    refundReason: Joi.string().min(10).max(500).required().messages({
      'string.min': 'Reason must be at least 10 characters',
      'string.max': 'Reason must not exceed 500 characters',
      'any.required': 'Refund reason is required'
    })
  })
};

// Validation middleware factory
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      console.error(`Validation schema '${schemaName}' not found`);
      return next();
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

// Query parameter validation
const validateQuery = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return next();
    }

    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        message: 'Query validation failed',
        errors
      });
    }

    req.query = value;
    next();
  };
};

// Parameter validation
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        message: 'Parameter validation failed',
        errors
      });
    }

    req.params = value;
    next();
  };
};

module.exports = {
  validate,
  validateQuery,
  validateParams,
  schemas
};
