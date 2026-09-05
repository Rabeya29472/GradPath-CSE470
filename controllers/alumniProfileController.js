const alumniProfileModel = require('../models/alumniProfileModel');

function getProfiles(req, res) {
    try {
        const profiles = alumniProfileModel.getAllProfiles(req.query);
        res.json(profiles);
    } catch (error) {
        console.error('Error fetching alumni profiles:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load alumni career profiles.'
        });
    }
}

function addProfile(req, res) {
    try {
        const {
            name,
            studentId,
            gradYear,
            major,
            company,
            jobTitle,
            industry,
            linkedin,
            email,
            skills
        } = req.body;

        // Validation of required fields
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Alumni full name is required.'
            });
        }

        if (!gradYear) {
            return res.status(400).json({
                success: false,
                message: 'Graduation year is required.'
            });
        }

        if (!major || !major.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Specific major is required.'
            });
        }

        if (!company || !company.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Current employer / company is required.'
            });
        }

        if (!jobTitle || !jobTitle.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Industry job title is required.'
            });
        }

        const newProfile = alumniProfileModel.createProfile({
            name, studentId, gradYear, major, company,
            jobTitle, industry, linkedin, email, skills
        });

        res.status(201).json({
            success: true,
            message: 'Alumni career profile added successfully to the directory!',
            profile: newProfile
        });

    } catch (error) {
        console.error('Error saving alumni profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add alumni career profile.'
        });
    }
}

function updateProfile(req, res) {
    try {
        const profileId = req.params.id;
        const {
            name,
            studentId,
            gradYear,
            major,
            company,
            jobTitle,
            industry,
            linkedin,
            email,
            skills
        } = req.body;

        // Validation of required fields
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Alumni full name is required.'
            });
        }

        if (!gradYear) {
            return res.status(400).json({
                success: false,
                message: 'Graduation year is required.'
            });
        }

        if (!major || !major.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Specific major is required.'
            });
        }

        if (!company || !company.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Current employer / company is required.'
            });
        }

        if (!jobTitle || !jobTitle.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Industry job title is required.'
            });
        }

        const updatedProfile = alumniProfileModel.updateProfile(profileId, {
            name, studentId, gradYear, major, company,
            jobTitle, industry, linkedin, email, skills
        });

        if (!updatedProfile) {
            return res.status(404).json({
                success: false,
                message: 'Alumni career profile not found.'
            });
        }

        res.json({
            success: true,
            message: 'Alumni career profile updated successfully!',
            profile: updatedProfile
        });

    } catch (error) {
        console.error('Error updating alumni profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update alumni career profile.'
        });
    }
}

function deleteProfile(req, res) {
    try {
        const profileId = req.params.id;

        const deletedProfile = alumniProfileModel.deleteProfile(profileId);

        if (!deletedProfile) {
            return res.status(404).json({
                success: false,
                message: 'Alumni career profile not found.'
            });
        }

        res.json({
            success: true,
            message: `Alumni profile for ${deletedProfile.name} has been deleted successfully.`
        });

    } catch (error) {
        console.error('Error deleting alumni profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete alumni career profile.'
        });
    }
}

module.exports = {
    getProfiles,
    addProfile,
    updateProfile,
    deleteProfile
};
