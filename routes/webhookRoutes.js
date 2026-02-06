//routes/webhookRoutes.js

const express = require('express');
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { updateWebhook } = require('../controllers/webHookController');

router.put('/integration/webhook', protect, updateWebhook);

module.exports = router;