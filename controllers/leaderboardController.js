const leaderboardModel = require('../models/leaderboardModel');

function getLeaderboard(req, res) {
    try {
        const leaderboard = leaderboardModel.getLeaderboardData();
        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load leaderboard data.'
        });
    }
}

module.exports = {
    getLeaderboard
};
