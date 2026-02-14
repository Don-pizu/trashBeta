//models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//user schema
const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true,
		trim: true
	}, 
	lastName: {
		type: String,
		required: true,
		trim: true
	}, 
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true
	},
	password: {
		type: String,
		required: true,
		minlength: 6,
	},

	resetPasswordToken: { 
	  	type: String 
	},

	resetPasswordExpire: { 
	  	type: Date 
	}, 

	role: {
		type: String,
		enum: ['resident', 'staff', 'admin'],
		default: 'resident'
	},

	isVerified: {
		type: Boolean,
		default: false,
	},

	onboardingStep: {
    	type: String,
    	enum: ['REGISTERED', 'VERIFIED', 'ROLE_SELECTED', 'PROFILE_COMPLETED'],
    	default: 'REGISTERED'
  	},

	otp: {
		type: String,
	},

	otpExpires: {
		type: Date
	},


	profile: {
		phone: {
			type: String,
			required: false,
			unique: true,
			sparse: true,
			validate: {
				validator: function (v) {
					if (!v) return true; // allow null

					// E.164 format: + and up to 15 digits
		    		return /^\+[1-9]\d{6,14}$/.test(v); // using +234
				},
				message: "Phone number must be in international format, e.g. +2348012345678"
			}
		},

		locationArea: {
			type: String,
		},

		cityLGA: {
			type: String,
		},

		address: {
			type: String,
		},

		pickupReminder: {
			type: Boolean,
		},

		notificationChannel: {
			type: String,
			enum: [ 'EMAIL', 'SMS', 'BOTH' ],
			default: 'EMAIL'
		},

		avatar: {
			type: String,
			default: ''  // will store file  url
		}
	}

}, { timestamps: true });


//Password hashing before saving
userSchema.pre('save', async function () {
	if (!this.isModified('password')) {
		return; 
	}

	const salt = await bcrypt.genSalt(10);      //Generate salt

	this.password = await bcrypt.hash(this.password, salt);    //Hash password

	
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare (enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);