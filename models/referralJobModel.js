const fs = require('fs');
const path = require('path');

const referralJobsFile = path.join(__dirname, '..', 'referralJobs.json');

function readJobs() {
    if (!fs.existsSync(referralJobsFile)) {
        fs.writeFileSync(referralJobsFile, '[]');
    }
    const data = fs.readFileSync(referralJobsFile, 'utf8');
    return JSON.parse(data || '[]');
}

function writeJobs(jobs) {
    fs.writeFileSync(referralJobsFile, JSON.stringify(jobs, null, 2));
}

function getAllJobs(filters) {
    let jobs = readJobs();

    const { search, type, major } = filters || {};

    if (search) {
        const s = search.toLowerCase().trim();
        jobs = jobs.filter(j =>
            (j.title && j.title.toLowerCase().includes(s)) ||
            (j.company && j.company.toLowerCase().includes(s)) ||
            (j.description && j.description.toLowerCase().includes(s)) ||
            (j.location && j.location.toLowerCase().includes(s))
        );
    }

    if (type) {
        jobs = jobs.filter(j => j.type && j.type.toLowerCase() === type.toLowerCase());
    }

    if (major) {
        jobs = jobs.filter(j => j.major && j.major.toLowerCase() === major.toLowerCase());
    }

    return jobs;
}

function createJob(data) {
    const {
        title, company, type, major,
        location, description, applyLink,
        postedBy, postedYear
    } = data;

    const jobs = readJobs();

    const newJob = {
        id: Date.now(),
        title: title.trim(),
        company: company.trim(),
        type: type.trim(),
        major: major.trim(),
        location: location ? location.trim() : 'Dhaka, Bangladesh',
        description: description.trim(),
        applyLink: applyLink ? applyLink.trim() : '#',
        postedBy: postedBy ? postedBy.trim() : 'Verified Alumni',
        postedYear: postedYear ? String(postedYear) : '2025',
        verified: true,
        createdAt: new Date().toISOString()
    };

    jobs.unshift(newJob);
    writeJobs(jobs);
    return newJob;
}

function deleteJob(jobId) {
    const jobs = readJobs();
    const jobIndex = jobs.findIndex(j => String(j.id) === String(jobId));

    if (jobIndex === -1) {
        return null;
    }

    const deleted = jobs.splice(jobIndex, 1)[0];
    writeJobs(jobs);
    return deleted;
}

module.exports = {
    getAllJobs,
    createJob,
    deleteJob
};
