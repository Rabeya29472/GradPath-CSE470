const mentorMatchmakerModel = require('../models/mentorMatchmakerModel');

function getMentors(req, res) {
    try { res.json(mentorMatchmakerModel.getMentors(req.query)); }
    catch (error) { res.status(500).json({ success: false, message: 'Could not load mentor matches.' }); }
}

function requestMentorship(req, res) {
    try { res.status(201).json({ success: true, message: 'Mentorship request sent successfully.', request: mentorMatchmakerModel.requestMentorship(req.body) }); }
    catch (error) { res.status(error.statusCode || 500).json({ success: false, message: error.statusCode ? error.message : 'Could not send mentorship request.' }); }
}

module.exports = { getMentors, requestMentorship };
