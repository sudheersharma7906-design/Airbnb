const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { 
  registerUser, 
  loginUser, 
  getMe, 
  toggleWishlist,
  forgotPassword,
  verifyOTP,
  resendOTP,
  resetPassword,
  sendSignupOTP,
  verifySignupOTP,
  resendSignupOTP,
  signup
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Rate limiter for password recovery and signup endpoints
const recoveryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: 'Too many requests. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

// Validation rules
const emailValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  validateRequest
];

const verifyOtpValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isNumeric().withMessage('OTP must contain only numbers')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits'),
  validateRequest
];

const resetPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),
  body('confirmPassword')
    .notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  validateRequest
];

const signupOTPValidation = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full Name is required'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('mobile')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Please enter a valid mobile number in E.164 format (e.g. +1234567890)'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),
  body('confirmPassword')
    .notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  body('role')
    .trim()
    .notEmpty().withMessage('Account type selection is required')
    .isIn(['Guest', 'Host', 'user', 'host']).withMessage('Please select Guest or Host'),
  validateRequest
];

const verifySignupOtpValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('emailOtp')
    .trim()
    .notEmpty().withMessage('Email OTP is required')
    .isNumeric().withMessage('Email OTP must contain only numbers')
    .isLength({ min: 6, max: 6 }).withMessage('Email OTP must be exactly 6 digits'),
  body('mobileOtp')
    .optional({ checkFalsy: true })
    .trim()
    .isNumeric().withMessage('Mobile OTP must contain only numbers')
    .isLength({ min: 6, max: 6 }).withMessage('Mobile OTP must be exactly 6 digits'),
  validateRequest
];

const finalSignupValidation = [
  ...signupOTPValidation,
  validateRequest
];

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/wishlist', protect, toggleWishlist);

// Password recovery routes
router.post('/forgot-password', recoveryLimiter, emailValidation, forgotPassword);
router.post('/verify-otp', recoveryLimiter, verifyOtpValidation, verifyOTP);
router.post('/resend-otp', recoveryLimiter, emailValidation, resendOTP);
router.post('/reset-password', recoveryLimiter, resetPasswordValidation, resetPassword);

// Signup with OTP routes
router.post('/send-signup-otp', recoveryLimiter, signupOTPValidation, sendSignupOTP);
router.post('/verify-signup-otp', recoveryLimiter, verifySignupOtpValidation, verifySignupOTP);
router.post('/resend-signup-otp', recoveryLimiter, emailValidation, resendSignupOTP);
router.post('/signup', recoveryLimiter, finalSignupValidation, signup);

module.exports = router;
