//controllers/webHookController.js
const Integration = require('../models/integration');
const generateApiKey = require('../utils/apiKeyHelper');


exports.updateWebhook = async (req, res) => {

  	try {
    	const { webhookUrl } = req.body;

    	const integration = await Integration.findOneAndUpdate(
      		{ user: req.user.id },
      		{ webhookUrl },
      		{ new: true }
    	);

    	if (!integration) {
    		return res.status(404).json({ message: 'Integration not found' });
    	}

    	res.json(integration);

  	} catch (error) {
    	res.status(500).json({ message: error.message });
  	}
};
