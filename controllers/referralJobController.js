const referralJobModel = require('../models/referralJobModel');

function getJobs(req, res) {
    try {
        const jobs = referralJobModel.getAllJobs(req.query);
        res.json(jobs);
    } catch (error) {
        console.error('Error fetching referral jobs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load referral jobs.'
        });
    }
}

function postJob(req, res) {
    try {
        const {
            title,
            company,
            type,
            major,
            location,
            description,
            applyLink,
            postedBy,
            postedYear
        } = req.body;

        // Validation of required fields
        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Job title is required.'
            });
        }

        if (!company || !company.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Company name is required.'
            });
        }

        if (!type || !type.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Job type is required.'
            });
        }

        if (!major || !major.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Target major is required.'
            });
        }

        if (!description || !description.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Job description is required.'
            });
        }

        const newJob = referralJobModel.createJob({
            title, company, type, major, location,
            description, applyLink, postedBy, postedYear
        });

        res.status(201).json({
            success: true,
            message: 'Referral job posted successfully!',
            job: newJob
        });

    } catch (error) {
        console.error('Error saving referral job:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to post referral job.'
        });
    }
}

function deleteJob(req, res) {
    try {
        const jobId = req.params.id;

        const deleted = referralJobModel.deleteJob(jobId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Job listing not found.'
            });
        }

        res.json({
            success: true,
            message: `Job listing "${deleted.title}" deleted successfully.`
        });

    } catch (error) {
        console.error('Error deleting referral job:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete job listing.'
        });
    }
}

module.exports = {
    getJobs,
    postJob,
    deleteJob
};
