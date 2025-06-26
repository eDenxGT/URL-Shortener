// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {login,register,verifyOTP,resendOTP} = require('../controller/userController');
const auth = require('../middleware/auth');

router.post('/register',register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
module.exports = router;
