const portfolioReviewModel = require('../models/portfolioReviewModel');

function getReviews(req, res) {
    try {
        res.json(portfolioReviewModel.getQueue());
    } catch (error) {
        console.error('Error loading portfolio review queue:', error);
        res.status(500).json({ success: false, message: 'Could not load portfolio review requests.' });
    }
}

function createReview(req, res) {
    try {
        const review = portfolioReviewModel.createReview(req.body);
        res.status(201).json({
            success: true,
            message: 'Portfolio project submitted for senior developer review.',
            review
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : 'Failed to submit portfolio review request.'
        });
    }
}

function updateReview(req, res) {
    try {
        const review = portfolioReviewModel.updateReview(req.params.id, req.body.feedback, req.body.status);
        res.json({ success: true, message: 'Portfolio feedback saved.', review });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : 'Failed to save portfolio feedback.'
        });
    }
}

module.exports = { getReviews, createReview, updateReview };
