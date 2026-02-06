//routes/integrationRoutes.js

const express = require('express');
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { getIntegration } = require('../controllers/integrationController');

router.get('/integration', protect, getIntegration);

module.exports = router;