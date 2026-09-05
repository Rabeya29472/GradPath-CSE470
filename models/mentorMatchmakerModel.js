const fs = require('fs');
const path = require('path');

const requestFile = path.join(__dirname, '..', 'mentorRequests.json');
const mentors = [
    { name: 'Sarah Ahmed', goal: 'Software Engineer', industry: 'AI', exp: 6, company: 'Google', title: 'Senior SWE', skills: ['Java', 'Node', 'React'] },
    { name: 'Rakib Hasan', goal: 'Software Engineer', industry: 'FinTech', exp: 4, company: 'bKash', title: 'Backend Engineer', skills: ['Java', 'Spring', 'SQL'] },
    { name: 'Nabila Noor', goal: 'Data Analyst', industry: 'FinTech', exp: 5, company: 'Mastercard', title: 'Data Analyst', skills: ['Python', 'SQL', 'Power BI'] },
    { name: 'Ayan Khan', goal: 'UI Designer', industry: 'EdTech', exp: 7, company: '10 Minute School', title: 'Product Designer', skills: ['Figma', 'UX', 'Design'] },
    { name: 'Tanvir Islam', goal: 'Cybersecurity', industry: 'Healthcare', exp: 9, company: 'Cisco', title: 'Security Engineer', skills: ['SOC', 'Network', 'Linux'] }
];

function getMentors(filters = {}) {
    const goal = String(filters.goal || '');
    const industry = String(filters.industry || '');
    const experience = Number(filters.experience || 0);
    return mentors.map(mentor => {
        let score = 0;
        if (mentor.goal === goal) score += 50;
        if (mentor.industry === industry) score += 30;
        if (mentor.exp >= experience) score += 20;
        return { ...mentor, score };
    }).filter(mentor => mentor.score > 0).sort((left, right) => right.score - left.score);
}

function requestMentorship(details) {
    if (!details.mentorName || !details.studentId) {
        const error = new Error('Student ID and mentor name are required.');
        error.statusCode = 400;
        throw error;
    }
    const requests = fs.existsSync(requestFile) ? JSON.parse(fs.readFileSync(requestFile, 'utf8') || '[]') : [];
    const request = { id: Date.now(), studentId: String(details.studentId).trim(), mentorName: String(details.mentorName).trim(), status: 'Pending', createdAt: Date.now() };
    requests.push(request);
    fs.writeFileSync(requestFile, JSON.stringify(requests, null, 2));
    return request;
}

module.exports = { getMentors, requestMentorship };
