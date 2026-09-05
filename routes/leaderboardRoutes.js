const express = require('express');

const router = express.Router();

const leaderboardController = require('../controllers/leaderboardController');

// Get alumni engagement leaderboard data
router.get('/', leaderboardController.getLeaderboard);

module.exports = router;
