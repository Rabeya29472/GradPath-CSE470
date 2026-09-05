const questionVaultModel = require('../models/questionVaultModel');

function getQuestions(req, res) {
    try { res.json(questionVaultModel.getQuestions()); }
    catch (error) { res.status(500).json({ success: false, message: 'Could not load interview questions.' }); }
}

function createQuestion(req, res) {
    try { res.status(201).json({ success: true, message: 'Question submitted successfully.', question: questionVaultModel.createQuestion(req.body) }); }
    catch (error) { res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Could not submit question.' }); }
}

function markHelpful(req, res) {
    try { res.json({ success: true, question: questionVaultModel.markHelpful(req.params.id) }); }
    catch (error) { res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Could not mark question helpful.' }); }
}

module.exports = { getQuestions, createQuestion, markHelpful };
