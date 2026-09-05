const fs = require('fs');
const path = require('path');

const bookingFile = path.join(__dirname, '..', 'bookingData.json');
const URGENT_WINDOW_HOURS = 48;

function readBookings() {
	if (!fs.existsSync(bookingFile)) {
		fs.writeFileSync(bookingFile, '[]');
	}

	const data = fs.readFileSync(bookingFile, 'utf8');
	return JSON.parse(data || '[]');
}

function getHoursUntilInterview(interviewDateTime) {
	if (!interviewDateTime) {
		return null;
	}

	const interviewTime = new Date(interviewDateTime).getTime();
	if (Number.isNaN(interviewTime)) {
		return null;
	}

	return (interviewTime - Date.now()) / (1000 * 60 * 60);
}

function sortQueue(bookings) {
	return [...bookings].sort((left, right) => {
		const urgentDifference = Number(Boolean(right.urgentInterview)) - Number(Boolean(left.urgentInterview));
		if (urgentDifference !== 0) {
			return urgentDifference;
		}

		if (left.urgentInterview && right.urgentInterview) {
			const leftDeadline = new Date(left.interviewDateTime).getTime();
			const rightDeadline = new Date(right.interviewDateTime).getTime();
			if (leftDeadline !== rightDeadline) {
				return leftDeadline - rightDeadline;
			}
		}

		return Number(left.createdAt || left.id) - Number(right.createdAt || right.id);
	});
}

function getQueue() {
	return sortQueue(readBookings()).map(booking => ({
		...booking,
		priority: booking.urgentInterview ? 'urgent' : 'standard',
		hoursUntilInterview: getHoursUntilInterview(booking.interviewDateTime)
	}));
}

function hasBookedSlot(mentor, time) {
	return readBookings().some(booking => booking.mentor === mentor && booking.time === time);
}

function createBooking(details) {
	const isUrgent = Boolean(details.urgentInterview);
	const hoursUntilInterview = getHoursUntilInterview(details.interviewDateTime);

	if (isUrgent && (hoursUntilInterview === null || hoursUntilInterview <= 0 || hoursUntilInterview >= URGENT_WINDOW_HOURS)) {
		const error = new Error('The real-world interview must be within the next 48 hours.');
		error.statusCode = 400;
		throw error;
	}

	const bookings = readBookings();
	const newBooking = {
		id: Date.now(),
		studentName: String(details.studentName).trim(),
		studentId: String(details.studentId).trim(),
		mentor: String(details.mentor).trim(),
		time: String(details.time).trim(),
		urgentInterview: isUrgent,
		interviewDateTime: isUrgent ? new Date(details.interviewDateTime).toISOString() : null,
		createdAt: Date.now()
	};

	bookings.push(newBooking);
	fs.writeFileSync(bookingFile, JSON.stringify(bookings, null, 2));

	return {
		...newBooking,
		priority: isUrgent ? 'urgent' : 'standard',
		hoursUntilInterview: getHoursUntilInterview(newBooking.interviewDateTime)
	};
}

module.exports = {
	getQueue,
	getHoursUntilInterview,
	hasBookedSlot,
	createBooking
};
