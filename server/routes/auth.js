// File: server/routes/auth.js

const express = require('express');
const router = express.Router();

// FIXED: All functions are now correctly imported from authController
const {
  registerStudent,
  registerCompany,
  loginUser,
  forgotPassword,
  resetPassword,
  sendAdminOtp,
  resetAdminPasswordWithOtp,
  googleLogin,
} = require('../controllers/authController');

// --- Register & Login Routes ---
router.post('/register/student', registerStudent);
router.post('/register/company', registerCompany);
router.post('/login', loginUser);

// --- Password Reset Routes ---
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// --- Admin OTP Reset (to match current frontend) ---
router.post('/admin/forgot-password', sendAdminOtp);
router.post('/admin/reset-password', resetAdminPasswordWithOtp);

// --- Google Login ---
router.post('/google', googleLogin);

module.exports = router;