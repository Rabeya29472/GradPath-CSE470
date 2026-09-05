const fs = require('fs');
const path = require('path');

const skillGapFile = path.join(__dirname, '..', 'data', 'skillGapData.json');

function readAssessments() {
    try {
        if (!fs.existsSync(skillGapFile)) {
            fs.writeFileSync(skillGapFile, '[]');
        }

        const data = fs.readFileSync(skillGapFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading skill-gap data:', error);
        return [];
    }
}

function writeAssessments(assessments) {
    fs.writeFileSync(
        skillGapFile,
        JSON.stringify(assessments, null, 4)
    );
}

function createAssessment(assessment) {
    const assessments = readAssessments();

    const newAssessment = {
        id: Date.now().toString(),
        ...assessment,
        createdAt: new Date().toISOString()
    };

    assessments.push(newAssessment);
    writeAssessments(assessments);

    return newAssessment;
}

function getAllAssessments() {
    return readAssessments();
}

function getAssessmentsByStudent(studentId) {
    return readAssessments().filter(
        assessment => assessment.studentId === studentId
    );
}

module.exports = {
    createAssessment,
    getAllAssessments,
    getAssessmentsByStudent
};