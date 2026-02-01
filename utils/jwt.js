//util/jwt.js

const jwt = require('jsonwebtoken');

//Generate JWT Token
exports.createToken = (user) => {
	return jwt.sign (
		{id: user._id, role: user.role},
		process.env.JWT_SECRET,
		{expiresIn: process.env.JWT_EXPIRES_IN }
		);
};