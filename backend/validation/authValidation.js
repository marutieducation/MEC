const Joi = require('joi');

const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required().messages({
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
  }),
  role: Joi.string().valid('student', 'admin', 'university_partner').default('student'),
  adminCode: Joi.string().optional().allow(''),
  phone: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  selectedDestinations: Joi.array().items(Joi.string()).optional(),
  selectedDegrees: Joi.array().items(Joi.string()).optional(),
  specialization: Joi.string().optional().allow(''),
  intakeTerm: Joi.string().optional().allow(''),
  budget: Joi.string().optional().allow(''),
  universityId: Joi.string().optional().allow(null, '')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string().valid('student', 'admin', 'university_partner').optional()
});

module.exports = { registerSchema, loginSchema };
