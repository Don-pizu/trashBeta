//middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require("../models/User");


//Middleware to verify token
exports.protect = async (req, res, next) => {
  let token;

  // condition to check for Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not Authorized, token failed' });
    }
  }

  return res.status(401).json({ message: 'Not Authorized, No token' });
};



exports.admin = (req, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  } else {
    return res.status(403).json({ message: 'Not authorized as admin' });
  }
};


exports.requireOnboardingComplete = async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.onboardingStep !== 'PROFILE_COMPLETED') {
    return res.status(403).json({
      message: 'Complete onboarding to continue'
    });
  }

  next();
};


exports.blockIfProfileCompleted = async (req, res, next) => {
  if (req.user.onboardingStep === 'PROFILE_COMPLETED') {
    return res.status(400).json({
      message: 'User has completed the onboarding'
    });
  }
  next();
};

