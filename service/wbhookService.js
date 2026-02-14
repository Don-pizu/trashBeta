//service/webhookSrvic.js

const axios = require('axios');
const Integration = require('../models/integration');

exports.sendWebhook = async (userId, event, payload) => {
  try {
    const integration = await Integration.findOne({ user: userId });

    if (!integration || !integration.webhookUrl) return;

    await axios.post(integration.webhookUrl, {
      event,
      data: payload,
      timestamp: new Date()
    });

  } catch (err) {
    console.error("Webhook failed:", err.message);
  }
};
