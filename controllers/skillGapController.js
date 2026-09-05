const fs = require('fs');
const path = require('path');

const skillGapModel = require('../models/skillGapModel');

const universityDBFile = path.join(
    __dirname,
    '..',
    'mockUniversityDB.json'
);

const alumniProfilesFile = path.join(
    __dirname,
    '..',
    'alumniProfiles.json'
);

function readJSON(filePath) {
    return JSON.parse(
        fs.readFileSync(filePath, 'utf8')
    );
}

function getStudents(req, res) {
    try {
        const students = readJSON(universityDBFile);

        res.json(students);

    } catch (error) {
        console.error('Error loading students:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to load student records.'
        });
    }
}

function getAlumni(req, res) {
    try {
        const alumni = readJSON(alumniProfilesFile);

        const verifiedAlumni = alumni.filter(
            person => person.verified === true
        );

        res.json(verifiedAlumni);

    } catch (error) {
        console.error('Error loading alumni:', error);

        res.status(500).json({
            success: false,
            message: 'Unable to load alumni records.'
        });
    }
}

function createAssessment(req, res) {
    try {
        const {
            studentId,
            alumniId,
            skillGaps,
            recommendation
        } = req.body;

        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: 'Student ID is required.'
            });
        }

        if (!alumniId) {
            return res.status(400).json({
                success: false,
                message: 'Alumni reviewer is required.'
            });
        }

        if (!Array.isArray(skillGaps) || skillGaps.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please select at least one skill gap.'
            });
        }

        if (!recommendation || !recommendation.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a recommendation.'
            });
        }

        const students = readJSON(universityDBFile);

        const student = students.find(
            item => item.studentId === studentId
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found.'
            });
        }

        const alumni = readJSON(alumniProfilesFile);

        const reviewer = alumni.find(
            person =>
                String(person.id) === String(alumniId) &&
                person.verified === true
        );

        if (!reviewer) {
            return res.status(404).json({
                success: false,
                message: 'Alumni reviewer not found.'
            });
        }

        const assessment =
            skillGapModel.createAssessment({
                studentId: student.studentId,
                studentMajor: student.major,
                studentGradYear: student.gradYear,

                alumniId: reviewer.id,
                alumniName: reviewer.name,
                alumniCompany: reviewer.company,
                alumniJobTitle: reviewer.jobTitle,

                skillGaps,
                recommendation: recommendation.trim()
            });

        res.status(201).json({
            success: true,
            message: 'Skill-gap assessment submitted successfully.',
            assessment
        });

    } catch (error) {
        console.error(
            'Error creating skill-gap assessment:',
            error
        );

        res.status(500).json({
            success: false,
            message: 'Unable to save skill-gap assessment.'
        });
    }
}

function getStudentAssessments(req, res) {
    try {
        const { studentId } = req.params;

        const assessments =
            skillGapModel.getAssessmentsByStudent(studentId);

        res.json({
            success: true,
            assessments
        });

    } catch (error) {
        console.error(
            'Error loading assessments:',
            error
        );

        res.status(500).json({
            success: false,
            message: 'Unable to load skill-gap assessments.'
        });
    }
}

module.exports = {
    getStudents,
    getAlumni,
    createAssessment,
    getStudentAssessments
};