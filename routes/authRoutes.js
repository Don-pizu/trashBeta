//routes/authRoutes.js

const express = require('express');
const router = express.Router();
const {
		register, verifyOtp, resendOtp, updateRole, 
		updateProfile, login, getUserById, getAllUsers, 
		forgotPassword, resetPassword, getUserProfile
	} = require ('../controllers/authController');
const { 
		protect, admin, 
		requireOnboardingComplete,
		blockIfProfileCompleted 
	} = require ('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');


router.post ('/register', register);
router.post ('/verifyOtp', verifyOtp);
router.post ('/resendOtp', resendOtp);
router.put ('/role', protect, updateRole);
router.put ('/profile', protect, blockIfProfileCompleted, upload.single('avatar'), updateProfile);
router.post ('/login', login );
router.get ('/user/:id', protect, admin, getUserById);
router.get ('/users', protect, requireOnboardingComplete, admin, getAllUsers);
router.post ('/forgotPassword', forgotPassword);
router.post ('/reset-password/:token', resetPassword);
router.get ('/me', protect, requireOnboardingComplete, getUserProfile);

module.exports = router;