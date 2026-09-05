const bookingModel = require('../models/bookingModel');

function getBookings(req, res) {
    try {
        res.json(bookingModel.getQueue());
    } catch (error) {
        console.error('Error loading mock-interview queue:', error);
        res.status(500).json({ success: false, message: 'Could not load interview requests.' });
    }
}

function createBooking(req, res) {
    const {
        studentName,
        studentId,
        mentor,
        time,
        interviewDateTime,
        realInterviewAt,
        urgentInterview
    } = req.body;
    const requestedInterviewTime = interviewDateTime || realInterviewAt;
    if (!studentName || !studentId || !mentor || !time) {
        return res.status(400).json({ success: false, message: 'Name, student ID, mentor, and slot are required.' });
    }
    if (urgentInterview && !requestedInterviewTime) {
        return res.status(400).json({ success: false, message: 'Add your real-world interview date and time to use the booster.' });
    }
    const hoursUntilInterview = bookingModel.getHoursUntilInterview(requestedInterviewTime);
    if (urgentInterview && (hoursUntilInterview === null || hoursUntilInterview <= 0 || hoursUntilInterview >= 48)) {
        return res.status(400).json({ success: false, message: 'The Urgent Interview Preparation Booster is available only for interviews within the next 48 hours.' });
    }
    try {
        if (bookingModel.hasBookedSlot(mentor, time)) {
            return res.status(400).json({ success: false, message: 'This slot has already been booked.' });
        }
        const booking = bookingModel.createBooking({
            studentName,
            studentId,
            mentor,
            time,
            interviewDateTime: requestedInterviewTime,
            urgentInterview
        });
        return res.status(201).json({ success: true, message: booking.urgentInterview ? 'Urgent request added to the top of the interview queue.' : 'Interview booked successfully.', booking });
    } catch (error) {
        console.error('Error creating mock-interview request:', error);
        return res.status(500).json({ success: false, message: 'Server error while creating the interview request.' });
    }
}

module.exports = { getBookings, createBooking };
