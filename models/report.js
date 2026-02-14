//models/report.js

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema ({

	trackingId: {
		type: String,
		required: true,
		unique: true,
		index: true,
	},

	category: {
		type: String,
		required: true,
		enum: [
			'illegal', 'overflowing', 'blocked', 
			'missed', 'general', 'burning',
			'uncategorized', 'other'
		]
	},

	state: {
		type: String,
		required: true,
	},

	lga: {
		type: String,
		required: true,
	},

	address: {
		type: String,
		required: true,
	},

	description: {
		type: String,
		maxlength: 500
	},

	images: [
		{
			type: String  //cloudinary URLs
		}
	],

	contactDetails: {
		name: String,
      	phone: String,
      	email: String 
	},

	priority: {
		type: String,
		enum: ['LOW', 'MEDIUM', 'HIGH'],
		default: 'LOW'
	},

	status: {
		type: String,
		enum: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
		default: 'PENDING'
	},

	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},

	assignedTo: {
      	type: mongoose.Schema.Types.ObjectId,
      	ref: 'User',
      	default: null
    },

    notificationPreference: {
	  	type: String,
	  	enum: ['EMAIL', 'SMS', 'BOTH'],
	  	default: 'EMAIL'
	},



},
	{
    	timestamps: true
  	}
);



module.exports = mongoose.model('Report', reportSchema);