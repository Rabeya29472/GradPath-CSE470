const fs = require('fs');
const path = require('path');

const alumniProfilesFile = path.join(__dirname, '..', 'alumniProfiles.json');
const universityDBFile = path.join(__dirname, '..', 'mockUniversityDB.json');

function readProfiles() {
    if (!fs.existsSync(alumniProfilesFile)) {
        fs.writeFileSync(alumniProfilesFile, '[]');
    }
    const data = fs.readFileSync(alumniProfilesFile, 'utf8');
    return JSON.parse(data || '[]');
}

function writeProfiles(profiles) {
    fs.writeFileSync(alumniProfilesFile, JSON.stringify(profiles, null, 2));
}

function getAllProfiles(filters) {
    let profiles = readProfiles();

    const { search, year, major, company, job, industry } = filters || {};

    if (search) {
        const s = search.toLowerCase().trim();
        profiles = profiles.filter(p =>
            (p.name && p.name.toLowerCase().includes(s)) ||
            (p.company && p.company.toLowerCase().includes(s)) ||
            (p.jobTitle && p.jobTitle.toLowerCase().includes(s)) ||
            (p.major && p.major.toLowerCase().includes(s)) ||
            (p.industry && p.industry.toLowerCase().includes(s)) ||
            (Array.isArray(p.skills) && p.skills.some(sk => sk.toLowerCase().includes(s)))
        );
    }

    if (year) {
        profiles = profiles.filter(p => String(p.gradYear) === String(year));
    }

    if (major) {
        profiles = profiles.filter(p => p.major && p.major.toLowerCase().includes(major.toLowerCase()));
    }

    if (company) {
        profiles = profiles.filter(p => p.company && p.company.toLowerCase().includes(company.toLowerCase()));
    }

    if (job) {
        profiles = profiles.filter(p => p.jobTitle && p.jobTitle.toLowerCase().includes(job.toLowerCase()));
    }

    if (industry) {
        profiles = profiles.filter(p => p.industry && p.industry.toLowerCase().includes(industry.toLowerCase()));
    }

    return profiles;
}

function parseSkills(skills) {
    let parsedSkills = [];
    if (Array.isArray(skills)) {
        parsedSkills = skills.map(s => String(s).trim()).filter(Boolean);
    } else if (typeof skills === 'string' && skills.trim()) {
        parsedSkills = skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    return parsedSkills;
}

function checkVerification(studentId, gradYear) {
    let isVerified = true;
    try {
        if (fs.existsSync(universityDBFile) && studentId) {
            const uniData = JSON.parse(fs.readFileSync(universityDBFile, 'utf8'));
            const match = uniData.find(
                s => s.studentId === studentId.trim() && (!gradYear || s.gradYear === parseInt(gradYear))
            );
            if (match) {
                isVerified = true;
            }
        }
    } catch (e) {
        console.warn('University check warning:', e.message);
    }
    return isVerified;
}

function createProfile(data) {
    const {
        name, studentId, gradYear, major, company,
        jobTitle, industry, linkedin, email, skills
    } = data;

    const profiles = readProfiles();
    const isVerified = checkVerification(studentId, gradYear);
    const parsedSkills = parseSkills(skills);

    const newProfile = {
        id: Date.now(),
        name: name.trim(),
        studentId: studentId ? studentId.trim() : '',
        gradYear: parseInt(gradYear) || Number(gradYear),
        major: major.trim(),
        company: company.trim(),
        jobTitle: jobTitle.trim(),
        industry: industry ? industry.trim() : 'Technology / Other',
        linkedin: linkedin ? linkedin.trim() : '',
        email: email ? email.trim() : '',
        skills: parsedSkills,
        verified: isVerified,
        createdAt: new Date().toISOString()
    };

    profiles.unshift(newProfile);
    writeProfiles(profiles);
    return newProfile;
}

function updateProfile(profileId, data) {
    const {
        name, studentId, gradYear, major, company,
        jobTitle, industry, linkedin, email, skills
    } = data;

    const profiles = readProfiles();
    const profileIndex = profiles.findIndex(p => String(p.id) === String(profileId));

    if (profileIndex === -1) {
        return null;
    }

    const parsedSkills = parseSkills(skills);
    const existing = profiles[profileIndex];

    const updatedProfile = {
        ...existing,
        name: name.trim(),
        studentId: studentId ? studentId.trim() : (existing.studentId || ''),
        gradYear: parseInt(gradYear) || Number(gradYear),
        major: major.trim(),
        company: company.trim(),
        jobTitle: jobTitle.trim(),
        industry: industry ? industry.trim() : (existing.industry || 'Technology / Other'),
        linkedin: linkedin !== undefined ? linkedin.trim() : (existing.linkedin || ''),
        email: email !== undefined ? email.trim() : (existing.email || ''),
        skills: parsedSkills,
        updatedAt: new Date().toISOString()
    };

    profiles[profileIndex] = updatedProfile;
    writeProfiles(profiles);
    return updatedProfile;
}

function deleteProfile(profileId) {
    const profiles = readProfiles();
    const profileIndex = profiles.findIndex(p => String(p.id) === String(profileId));

    if (profileIndex === -1) {
        return null;
    }

    const deletedProfile = profiles.splice(profileIndex, 1)[0];
    writeProfiles(profiles);
    return deletedProfile;
}

module.exports = {
    getAllProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
    readProfiles
};
