const express = require('express');

const router = express.Router();

const mockInterviewController = require('../controllers/mockInterviewController');

// Get mock interview readiness data (supports optional studentId query filter)
router.get('/', mockInterviewController.getMockInterviews);

module.exports = router;
