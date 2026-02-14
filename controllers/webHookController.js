//controllers/webHookController.js
const Integration = require('../models/integration');
const generateApiKey = require('../utils/apiKeyHelper');



exports.updateWebhook = async (req, res) => {
  try {
    const { webhookUrl } = req.body;

    if (!webhookUrl)
      return res.status(400).json({ message: "Webhook URL is required" });

    // Ensure integration exists
    let integration = await Integration.findOne({ user: req.user.id });

    if (!integration) {
      return res.status(404).json({ message: "Integration not initialized" });
    }

    integration.webhookUrl = webhookUrl;
    await integration.save();

    res.json({
      message: "Webhook updated successfully",
      webhookUrl: integration.webhookUrl
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
