const fs = require('fs');
const path = require('path');

const mockInterviewDataFile = path.join(__dirname, '..', 'mockInterviewData.json');

function readRecords() {
    if (!fs.existsSync(mockInterviewDataFile)) {
        fs.writeFileSync(mockInterviewDataFile, '[]');
    }
    const data = fs.readFileSync(mockInterviewDataFile, 'utf8');
    return JSON.parse(data || '[]');
}

function getAllRecords(filters) {
    let records = readRecords();

    const { studentId } = filters || {};

    if (studentId) {
        records = records.filter(r => String(r.studentId) === String(studentId));
    }

    return records;
}

module.exports = {
    getAllRecords
};
