//models/integration.js

const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema({
	user: {
    	type: mongoose.Schema.Types.ObjectId,
    	ref: 'User'
  	},
  	apiKey: {
  		type: String,
  		unique: true,
  		required: true
  	},
  	webhookUrl: String,
  	createdAt: {
    	type: Date,
    	default: Date.now
  	}
});

module.exports = mongoose.model('Integration', integrationSchema);
