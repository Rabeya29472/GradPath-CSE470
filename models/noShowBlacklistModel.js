const fs = require('fs');
const path = require('path');

const blacklistFile = path.join(
    __dirname,
    '..',
    'data',
    'noShowBlacklistData.json'
);

function readBlacklist() {
    try {
        if (!fs.existsSync(blacklistFile)) {
            fs.writeFileSync(blacklistFile, '[]');
        }

        const data = fs.readFileSync(
            blacklistFile,
            'utf8'
        );

        return JSON.parse(data);

    } catch (error) {
        console.error(
            'Error reading blacklist data:',
            error
        );

        return [];
    }
}

function writeBlacklist(records) {
    fs.writeFileSync(
        blacklistFile,
        JSON.stringify(records, null, 4)
    );
}

function createBlacklist(studentId, bookingId) {
    const records = readBlacklist();

    const now = new Date();

    const expiresAt = new Date(now);

    expiresAt.setDate(
        expiresAt.getDate() + 14
    );

    const record = {
        id: Date.now().toString(),
        studentId,
        bookingId,
        blacklistedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString()
    };

    records.push(record);

    writeBlacklist(records);

    return record;
}

function getActiveBlacklist(studentId) {
    const records = readBlacklist();

    const now = new Date();

    return records.find(record => {
        return (
            record.studentId === studentId &&
            new Date(record.expiresAt) > now
        );
    });
}

module.exports = {
    createBlacklist,
    getActiveBlacklist
};