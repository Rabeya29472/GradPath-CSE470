const express = require('express');

const router = express.Router();

const referralJobController = require('../controllers/referralJobController');

// Get all referral jobs (supports optional query filters)
router.get('/', referralJobController.getJobs);

// Post a new referral job
router.post('/', referralJobController.postJob);

// Delete a referral job
router.delete('/:id', referralJobController.deleteJob);

module.exports = router;
