/**
 * Joi Validation Schemas
 * Input validation for all API endpoints
 */
const Joi = require('joi');

// ==================== AUTH ====================
const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required()
    .messages({ 'any.required': 'Name is required' }),
  email: Joi.string().email().lowercase().trim().required()
    .messages({ 'string.email': 'Please provide a valid email' }),
  password: Joi.string().min(6).max(128).required()
    .messages({ 'string.min': 'Password must be at least 6 characters' }),
  phone: Joi.string().trim().allow('').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().optional(), // Can also come from cookie
});

// ==================== PRODUCT ====================
const createProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().min(10).max(500).required(),
  price: Joi.number().min(0).precision(2).required(),
  category: Joi.string().hex().length(24).required()
    .messages({ 'string.length': 'Invalid category ID' }),
  stock: Joi.number().integer().min(0).default(100),
  isActive: Joi.boolean().default(true),
  isFeatured: Joi.boolean().default(false),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  nutrition: Joi.object({
    calories: Joi.number().min(0).optional(),
    protein: Joi.string().allow('').optional(),
    carbs: Joi.string().allow('').optional(),
    fat: Joi.string().allow('').optional(),
  }).optional(),
});

const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  description: Joi.string().trim().min(10).max(500).optional(),
  price: Joi.number().min(0).precision(2).optional(),
  category: Joi.string().hex().length(24).optional(),
  stock: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  nutrition: Joi.object({
    calories: Joi.number().min(0).optional(),
    protein: Joi.string().allow('').optional(),
    carbs: Joi.string().allow('').optional(),
    fat: Joi.string().allow('').optional(),
  }).optional(),
}).min(1);

// ==================== ORDER ====================
const createOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().hex().length(24).required(),
      quantity: Joi.number().integer().min(1).max(20).required(),
    })
  ).min(1).required()
    .messages({ 'array.min': 'Order must have at least one item' }),
  shippingAddress: Joi.object({
    street: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
    state: Joi.string().trim().allow('').optional(),
    zipCode: Joi.string().trim().allow('').optional(),
  }).required(),
  paymentMethod: Joi.string().valid('cash', 'card', 'stripe').default('cash'),
  note: Joi.string().trim().max(500).allow('').optional(),
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('confirmed', 'preparing', 'ready', 'delivered', 'cancelled')
    .required(),
});

// ==================== CATEGORY ====================
const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  description: Joi.string().trim().max(200).allow('').optional(),
  icon: Joi.string().trim().optional(),
  image: Joi.string().trim().allow('').optional(),
  isActive: Joi.boolean().default(true),
  sortOrder: Joi.number().integer().min(0).default(0),
});

// ==================== QUERY ====================
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(12),
  sort: Joi.string().trim().optional(),
  search: Joi.string().trim().allow('').optional(),
  category: Joi.string().hex().length(24).optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  status: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  createProductSchema,
  updateProductSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  createCategorySchema,
  paginationSchema,
};
