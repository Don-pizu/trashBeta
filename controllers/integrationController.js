//controllers/integrationController.js
const Integration = require('../models/integration');
const generateApiKey = require('../utils/apiKeyHelper');


exports.getIntegration = async (req, res) => {
  try {
    let integration = await Integration.findOne({ user: req.user.id });

    if (!integration) {
      integration = await Integration.create({
        user: req.user.id,
        apiKey: generateApiKey()
      });
    }

    res.json({
      apiKey: integration.apiKey,
      webhookUrl: integration.webhookUrl || ""
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

