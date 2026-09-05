const noShowBlacklistModel = require(
    '../models/noShowBlacklistModel'
);

function markNoShow(req, res) {
    try {
        const {
            studentId,
            bookingId
        } = req.body;

        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: 'Student ID is required.'
            });
        }

        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID is required.'
            });
        }

        const existingBlacklist =
            noShowBlacklistModel.getActiveBlacklist(
                studentId
            );

        if (existingBlacklist) {
            return res.status(400).json({
                success: false,
                message:
                    'This student is already restricted from booking.'
            });
        }

        const record =
            noShowBlacklistModel.createBlacklist(
                studentId,
                bookingId
            );

        res.status(201).json({
            success: true,
            message:
                'No-show recorded. Student is restricted from booking for 14 days.',
            record
        });

    } catch (error) {
        console.error(
            'Error creating no-show blacklist:',
            error
        );

        res.status(500).json({
            success: false,
            message:
                'Unable to record the no-show.'
        });
    }
}

function checkBlacklist(req, res) {
    try {
        const { studentId } = req.params;

        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: 'Student ID is required.'
            });
        }

        const record =
            noShowBlacklistModel.getActiveBlacklist(
                studentId
            );

        res.json({
            success: true,
            blacklisted: !!record,
            record: record || null
        });

    } catch (error) {
        console.error(
            'Error checking blacklist:',
            error
        );

        res.status(500).json({
            success: false,
            message:
                'Unable to check blacklist status.'
        });
    }
}

module.exports = {
    markNoShow,
    checkBlacklist
};