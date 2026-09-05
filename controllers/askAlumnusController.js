const askAlumnusModel = require('../models/askAlumnusModel');

function getQuestions(req, res) {
    try {
        const questions = askAlumnusModel.getAllQuestions(req.query);
        res.json(questions);
    } catch (error) {
        console.error('Error fetching alumnus questions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load alumnus discussion questions.'
        });
    }
}

function getQuestion(req, res) {
    try {
        const question = askAlumnusModel.getQuestionById(req.params.id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Discussion question not found.'
            });
        }

        res.json(question);
    } catch (error) {
        console.error('Error fetching question details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load discussion details.'
        });
    }
}

function postQuestion(req, res) {
    try {
        const { studentName, studentId, category, title, description } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Question title is required.'
            });
        }

        if (!description || !description.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Question description is required.'
            });
        }

        const newQuestion = askAlumnusModel.createQuestion({
            studentName, studentId, category, title, description
        });

        res.status(201).json({
            success: true,
            message: 'Your question has been posted successfully!',
            question: newQuestion
        });

    } catch (error) {
        console.error('Error posting alumnus question:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to post question.'
        });
    }
}

function postReply(req, res) {
    try {
        const questionId = req.params.id;
        const { alumniName, alumniId, jobTitle, company, reply, verified } = req.body;

        if (!reply || !reply.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Reply content is required.'
            });
        }

        const result = askAlumnusModel.addReply(questionId, {
            alumniName, alumniId, jobTitle, company, reply, verified
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Question not found.'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Your reply has been posted to the discussion thread!',
            reply: result.reply,
            question: result.question
        });

    } catch (error) {
        console.error('Error posting reply:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to post reply.'
        });
    }
}

function deleteQuestion(req, res) {
    try {
        const questionId = req.params.id;

        const deleted = askAlumnusModel.deleteQuestion(questionId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Question not found.'
            });
        }

        res.json({
            success: true,
            message: 'Discussion question deleted successfully.'
        });

    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete question.'
        });
    }
}

function deleteReply(req, res) {
    try {
        const { questionId, replyId } = req.params;

        const result = askAlumnusModel.deleteReply(questionId, replyId);

        if (result.notFound === 'question') {
            return res.status(404).json({
                success: false,
                message: 'Question not found.'
            });
        }

        if (result.notFound === 'reply') {
            return res.status(404).json({
                success: false,
                message: 'Reply not found.'
            });
        }

        res.json({
            success: true,
            message: 'Reply deleted successfully.'
        });

    } catch (error) {
        console.error('Error deleting reply:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete reply.'
        });
    }
}

module.exports = {
    getQuestions,
    getQuestion,
    postQuestion,
    postReply,
    deleteQuestion,
    deleteReply
};
