//controllers/authController.js

const User = require('../models/User');
const { createToken } = require('../utils/jwt');
const crypto = require ('crypto');
const bcrypt = require('bcryptjs');
const { sendOtpEmail, forgotPassOtpEmail } = require('../utils/emailService');
const cloudinary = require('../config/cloudinary');
const fs = require('fs')
const {formatPhone } = require('../utils/phoneFormatter');


//POST 		Register a new user
exports.register = async (req, res) => {
	try {

		const { firstName, lastName, email, password, confirmPassword } = req.body;

		if (!firstName || !lastName || !email || !password || !confirmPassword)
			return res.status(400).json({ message: 'All the fields are required' });

		//Check if passwords match
		const cleanPassword = String(password).trim();
		const cleanConfirmPassword = String(confirmPassword).trim();

		if (cleanPassword !== cleanConfirmPassword)
			return res.status(400).json({ message: 'Passwords do not match' });

		//check for existing email
		const eExists = await User.findOne ({ email: email });
		if(eExists)
			return res.status(400).json({ message: 'Email already exists' });

		//Generate 4 digit OTP
		const otp = Math.floor(1000 + Math.random() * 9000).toString();
		const otpExpires = new Date(Date.now() + 10 * 60 * 1000);             // 10 min


		//create user database
		const user = await User.create({
			firstName,
			lastName,
			email,
			password,
			otp,
			otpExpires
		});


		//send OTP
		await sendOtpEmail(email, otp);


		res.status(201).json({
			message: `User registered. Verify OTP sent to ${user.email}`,
			_id: user._id,
	      	email: user.email,
		})

	} catch (err) {
		res.status(500).json({ message: err.message})
	}
};



//POST    Verify OTP
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    //find user
    const user = await User.findOne({ email });

    if (!user) 
      return res.status(400).json({ message: 'User not found' });

  	//if OTP do not match
    if (user.otp !== otp)
      return res.status(400).json({ message: 'Invalid OTP' });

  	//expired OTP
    if(user.otpExpires < Date.now()) 
      return res.status(400).json({ message: 'Expired OTP' });


    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.onboardingStep = 'VERIFIED';

    await user.save();

    res.json({ 
      message: 'Account verified successfully',
      _id: user._id,
      email: user.email,
      onboardingStep: user.onboardingStep,
      token: createToken(user)

    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Resend OTP
exports.resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if(!email)
      return res.status(400).json({ message: 'Email is required'});

  	//validate user
  	const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) 
      return res.status(400).json({ message: "User not found" });

    if (user.isVerified) 
      return res.status(400).json({ message: "Account already verified" });

    // Generate new OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 min

    //update user detials
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    //Resend otp mail
    await sendOtpEmail(user.email, otp);

    res.json({ 
      message: "New OTP sent to email",
      email: user.email
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//PUT   Update role
exports.updateRole = async (req, res) => {
	try {
		const userId = req.user.id; 
		const { role } = req.body;

		//Allowed role
		const allowedRole = ['resident', 'staff', 'admin'];

		if (!allowedRole.includes(role))
			return res.status(404).json({ message: 'Role must be resident, staff or admin'});

		const user = await User.findByIdAndUpdate(
			userId,
			{ 
				role,
				onboardingStep: 'ROLE_SELECTED' 
			},
			{ new: true, runValidators: true }
		);


		//Validate user
		if(!user)
			return res.status(404).json({ message: 'User not found' });

		res.json({
			message: 'User role updated',
			user: {
				_id: user._id,
				email: user.email,
				role: user.role,
				onboardingStep: user.onboardingStep
			}
		});

	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};


//PUT  Update Profile
exports.updateProfile = async (req, res) => {
	try {

		const userId = req.user.id;

		let {
			phone, locationArea, cityLGA,
			address, pickupReminder, notificationChannel
		} = req.body;

		if(!phone)
			return res.status(400).json({ message: 'Phone number is required'});

		// Format phone number before saving
    phone = formatPhone(phone);

    // Check if phone already belongs to another user
		const phoneExists = await User.findOne({
		  "profile.phone": phone,
		  _id: { $ne: userId } // exclude current user
		});

		if (phoneExists) {
	  	return res.status(400).json({ 
	    	message: "Phone number already in use" 
	  	});
		}

    const allowedNotification = ['EMAIL', 'SMS'];

    if (notificationChannel && !allowedNotification.includes(notificationChannel))
    	return res.status(404).json({ message: `Allowed notification channels are: ${allowedNotification}`});

		if( req.user.onboardingStep === 'PROFILE_COMPLETED' )
			return res.status(404).json({ message: 'User has completed the onboarding' });

		const updateFileds = {
								phone, locationArea, cityLGA,
								address, pickupReminder, notificationChannel
							};

		//If profile/avatar is uploaded
		if(req.file) {
			updateFileds.avatar = req.file.path;
		}

		//find user and update
		const user = await User.findByIdAndUpdate(
			userId,
			{
				profile: updateFileds,
				onboardingStep: 'PROFILE_COMPLETED',
			},
			 { new: true }
		);

		//Validate user
		if(!user)
			return res.status(404).json({ message: 'User not found' });

		res.json({ 
			message: 'Profile completed',
			user: {
				_id: user._id,
				email: user.email,
				avatar: user.profile?.avatar,
				role: user.role
			}
		});


	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};


//Login user 
exports.login = async (req, res) => {
	try{

		const { email, password } = req.body;

    if(!email || !password)
      return res.status(400).json({ messag: "Email and Password are required" });

		//check for User using email 
		const user = await User.findOne({ email: email });
		if(!user)
			return res.status(401).json({message: 'User is not found, Kindly check the email you entered'});

		if (!user.isVerified) 
		  return res.status(401).json({ message: "Please verify your account first" });

		//check for completed onboarding
		if (user.onboardingStep !== 'PROFILE_COMPLETED') 
			return res.status(200).json({
			    message: 'Onboarding incomplete, Kindly complete it',
			    onboardingStep: user.onboardingStep,
			    token: createToken(user),
			    role: user.role,
    			_id: user._id,
    			email: user.email
			});
			

		const userPassword = await user.matchPassword(password);
		if(!userPassword)
			return res.status(401).json({message: 'Incorrect password'});

		if ( user && userPassword ) {
			res.json({
				_id: user._id,
				email: user.email,
				role:user.role,
				token: createToken(user)
			});
		} else {
			return res.status(401).json({ message: 'Invalid Credentials'});
		}

	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};


//GET user by id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if(!user)
      return res.status(400).json({ message: 'User not found'});

    res.json({
      _id: user._id,
      email: user.email,
      avatar: user.profile?.avatar,
      role: user.role,
    });
    
  } catch (err) {
     res.status(500).json({ message: err.message });
  }
}


//GET   Get all users

exports.getAllUsers = async (req, res) => {
	try {

		const {page = 1, limit = 10, email} = req.query;
		const query = {};   //for filtering

	if (email) 
		query.email = email;

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const users = await User.find(query)
		 								.skip(skip)
		 								.limit(parseInt(limit))
		 								.sort({createdAt: -1});

		const totalUsers = await User.countDocuments(query);
		const totalPages = Math.ceil(totalUsers / limit);

		res.json({
			users,
			page: parseInt(page),
			totalPages,
			totalUsers
		});

	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};



// forgotPassword
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) 
    	return res.status(400).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;    // 15 min

    await user.save({ validateBeforeSave: false });

    // Build reset URL
    const resetUrl = `https://thrashbeta.vercel.app/auth/new-password.html?token=${resetToken}`; ///////change to frontend link

    // send via email
    await forgotPassOtpEmail(user.email, `Reset your password using this link: ${resetUrl}`);

    res.json({ message: "Password reset link sent to email" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Hash the token from URL to compare with DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");


    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() } 
    });

    if (!user) 
    	return res.status(400).json({ message: "Invalid token" });

    if( user.resetPasswordExpire < Date.now() )
      return res.status(400).json({ message: 'Expired Token'})


    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    res.json({ message: "Password reset successful. You can now login." });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//PUT Update user details
exports.updateUserDetails = async (req, res) => {
	try {

		const userId = req.user.id;

		const { firstName, lastName, role, 
						phone, locationArea, cityLGA, 
						address, notificationChannel
					} = req.body;

		//Allowed role
		const allowedRole = ['resident', 'staff', 'admin'];

		if (role && !allowedRole.includes(role))
			return res.status(404).json({ message: 'Role is not allowed'});
		
		if (role && req.user.role !== 'admin') 
  		return res.status(403).json({ message: 'Only admin can update role' });
		
		const allowedNotification = ['EMAIL', 'SMS'];
		if (notificationChannel && !allowedNotification.includes(notificationChannel))
			return res.status(404).json({ message: `Allowed notification channels are: ${allowedNotification}`});

		

		const updateRoot = {};
		const updateProfile = {};

		if (firstName) updateRoot.firstName = firstName;
		if (lastName) updateRoot.lastName = lastName;
		if (role) updateRoot.role = role;

		if (phone) updateProfile.phone = formatPhone(phone);
		if (locationArea) updateProfile.locationArea = locationArea;
		if (cityLGA) updateProfile.cityLGA = cityLGA;
		if (address) updateProfile.address = address;
		if (notificationChannel) updateProfile.notificationChannel = notificationChannel;

		if (req.file) {
			updateProfile.avatar = req.file.path;
		}

		//find user and update
		const user = await User.findByIdAndUpdate(
			userId,
			{
				...updateRoot,
    		...(Object.keys(updateProfile).length && { profile: updateProfile })
			},
			 { new: true }
		);

		//Validate user
		if(!user)
			return res.status(404).json({ message: 'User not found' });

		res.json({ 
			message: 'Profile completed',
			 user: {
	    	_id: user._id,
	    	email: user.email,
	    	firstName: user.firstName,
	    	lastName: user.lastName,
	    	role: user.role,
	    	profile: {
	      	avatar: user.profile?.avatar,
	      	phone: user.profile?.phone,
	      	locationArea: user.profile?.locationArea,
	      	cityLGA: user.profile?.cityLGA,
	      	address: user.profile?.address,
	      	notificationChannel: user.profile?.notificationChannel
	    	}
			}
		});

	} catch (err) {
		res.status(500).json({ message: err.message });
	}
}

// GET USER PROFILE
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
   
    if (!user) 
    	return res.status(404).json({ message: "User not found" });

    res.json({
      _id: user._id,
      email: user.email,
      avatar: user.profile?.avatar,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
