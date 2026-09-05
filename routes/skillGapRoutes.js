const express = require('express');

const router = express.Router();

const skillGapController =
    require('../controllers/skillGapController');

router.get(
    '/students',
    skillGapController.getStudents
);

router.get(
    '/alumni',
    skillGapController.getAlumni
);

router.post(
    '/assessments',
    skillGapController.createAssessment
);

router.get(
    '/assessments/student/:studentId',
    skillGapController.getStudentAssessments
);

module.exports = router;