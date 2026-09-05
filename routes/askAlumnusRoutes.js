const express = require('express');

const router = express.Router();

const askAlumnusController = require('../controllers/askAlumnusController');

// Get all forum questions (with search, category, status, student filters)
router.get('/', askAlumnusController.getQuestions);

// Get a single question thread by questionId
router.get('/:id', askAlumnusController.getQuestion);

// Post a new question
router.post('/', askAlumnusController.postQuestion);

// Post a reply to a question
router.post('/:id/replies', askAlumnusController.postReply);

// Delete a question
router.delete('/:id', askAlumnusController.deleteQuestion);

// Delete a reply from a question
router.delete('/:questionId/replies/:replyId', askAlumnusController.deleteReply);

module.exports = router;
