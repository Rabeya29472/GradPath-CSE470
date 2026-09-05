const express = require('express');

const router = express.Router();

const alumniProfileController = require('../controllers/alumniProfileController');

// Get all alumni career profiles (supports optional query filters)
router.get('/', alumniProfileController.getProfiles);

// Add a new alumni career profile
router.post('/', alumniProfileController.addProfile);

// Update an existing alumni career profile
router.put('/:id', alumniProfileController.updateProfile);

// Delete an alumni career profile
router.delete('/:id', alumniProfileController.deleteProfile);

module.exports = router;
