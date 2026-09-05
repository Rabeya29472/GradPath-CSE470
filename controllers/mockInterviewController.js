const mockInterviewModel = require('../models/mockInterviewModel');

function getMockInterviews(req, res) {
    try {
        const records = mockInterviewModel.getAllRecords(req.query);
        res.json(records);
    } catch (error) {
        console.error('Error fetching mock interview data:', error);
        res.status(500).json({ error: 'Failed to fetch mock interview data.' });
    }
}

module.exports = {
    getMockInterviews
};
