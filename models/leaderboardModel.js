const fs = require('fs');
const path = require('path');

const alumniProfilesFile = path.join(__dirname, '..', 'alumniProfiles.json');

function readProfiles() {
    if (!fs.existsSync(alumniProfilesFile)) {
        fs.writeFileSync(alumniProfilesFile, '[]');
    }
    const data = fs.readFileSync(alumniProfilesFile, 'utf8');
    return JSON.parse(data || '[]');
}

function getLeaderboardData() {
    const profiles = readProfiles();

    // Only include verified alumni and sort by engagement metrics
    const verifiedAlumni = profiles.filter(p => p.verified === true);

    // Map to leaderboard entries
    const leaderboard = verifiedAlumni.map(p => ({
        id: p.id,
        name: p.name,
        jobTitle: p.jobTitle,
        company: p.company,
        major: p.major,
        gradYear: p.gradYear,
        industry: p.industry,
        mentoringSessions: p.mentoringSessions || 0,
        resumeReviews: p.resumeReviews || 0,
        totalEngagement: (p.mentoringSessions || 0) + (p.resumeReviews || 0),
        verified: p.verified
    }));

    // Sort by totalEngagement descending
    leaderboard.sort((a, b) => b.totalEngagement - a.totalEngagement);

    return leaderboard;
}

module.exports = {
    getLeaderboardData
};
