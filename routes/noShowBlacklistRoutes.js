const express = require('express');

const router = express.Router();

const noShowBlacklistController =
    require('../controllers/noShowBlacklistController');

router.post(
    '/blacklist',
    noShowBlacklistController.markNoShow
);

router.get(
    '/check/:studentId',
    noShowBlacklistController.checkBlacklist
);

module.exports = router;