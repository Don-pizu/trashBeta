//routes/authRoutes.js

const express = require('express');
const router = express.Router();
const {
		register, verifyOtp, resendOtp, updateRole, 
		updateProfile, updateUserDetails, login, getUserById, getAllUsers, 
		forgotPassword, resetPassword, getUserProfile
	} = require ('../controllers/authController');
const { 
		protect, admin, 
		requireOnboardingComplete,
		blockIfProfileCompleted 
	} = require ('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');



/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [resident, staff, admin]
 *         isVerified:
 *           type: boolean
 *         onboardingStep:
 *           type: string
 *           enum: [REGISTERED, VERIFIED, ROLE_SELECTED, PROFILE_COMPLETED]
 *         profile:
 *           type: object
 *           properties:
 *             phone:
 *               type: string
 *               example: "+2348012345678"
 *             locationArea:
 *               type: string
 *             cityLGA:
 *               type: string
 *             address:
 *               type: string
 *             notificationChannel:
 *               type: string
 *               enum: [EMAIL, SMS]
 *             avatar:
 *               type: string
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */




/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password, confirmPassword]
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered, OTP sent
 *       400:
 *         description: Validation error
 */


/**
 * @swagger
 * /auth/verifyOtp:
 *   post:
 *     summary: Verify email OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account verified
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid or expired OTP
 */

/**
 * @swagger
 * /auth/resendOtp:
 *   post:
 *     summary: Resend OTP to email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP resent
 */



/**
 * @swagger
 * /auth/role:
 *   put:
 *     summary: Update user role
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [resident, staff, admin]
 *     responses:
 *       200:
 *         description: Role updated
 */


/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Complete user onboarding profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               locationArea:
 *                 type: string
 *               cityLGA:
 *                 type: string
 *               address:
 *                 type: string
 *               notificationChannel:
 *                 type: string
 *                 enum: [EMAIL, SMS]
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile completed
 */

/**
 * @swagger
 * /auth/user/profile:
 *   put:
 *     summary: Update user details (admin or self)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [resident, staff, admin]
 *               phone:
 *                 type: string
 *                 example: "+2348012345678"
 *               locationArea:
 *                 type: string
 *               cityLGA:
 *                 type: string
 *               address:
 *                 type: string
 *               notificationChannel:
 *                 type: string
 *                 enum: [EMAIL, SMS]
 *               avatar:
 *                 type: string
 *                 format: binary
 *             description: "All fields are optional. Role can only be updated by admin."
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden, only admin can update role
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */


/**
 * @swagger
 * /auth/user/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: User data
 */


/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated users
 */



/**
 * @swagger
 * /auth/forgotPassword:
 *   post:
 *     summary: Send password reset email
 *     tags: [Auth]
 */


/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 */



/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 */


router.post ('/register', register);
router.post ('/verifyOtp', verifyOtp);
router.post ('/resendOtp', resendOtp);
router.put ('/role', protect, updateRole);
router.put ('/profile', protect, blockIfProfileCompleted, upload.single('avatar'), updateProfile);
router.put ('/user/profile', protect, requireOnboardingComplete, upload.single('avatar'), updateUserDetails);
router.post ('/login', login );
router.get ('/user/:id', protect, admin, getUserById);
router.get ('/users', protect, requireOnboardingComplete, admin, getAllUsers);
router.post ('/forgotPassword', forgotPassword);
router.post ('/reset-password/:token', resetPassword);
router.get ('/me', protect, requireOnboardingComplete, getUserProfile);

module.exports = router;