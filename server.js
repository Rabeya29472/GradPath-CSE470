const express = require('express');
const fs = require('fs');
const path = require('path');
const bookingFile = './bookingData.json'; //added by rabeya//
const evaluationFile = './interviewEvaluations.json';
const alumniProfilesFile = './alumniProfiles.json';
const referralJobsFile = './referralJobs.json';
const mockInterviewDataFile = './mockInterviewData.json';
const askAlumnusDataFile = './askAlumnusData.json';


const app = express();
const PORT = 8000;
const multer = require('multer');
const skillGapRoutes = require('./routes/skillGapRoutes');
const noShowBlacklistRoutes =require('./routes/noShowBlacklistRoutes');
const noShowBlacklistModel =require('./models/noShowBlacklistModel');
// Resume Upload Configuration

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, path.join(__dirname, "public/uploads"));

    },

    filename: (req, file, cb) => {

        const uniqueName = Date.now() + "_" + file.originalname;

        cb(null, uniqueName);

    }

});

const upload = multer({

    storage: storage,

    fileFilter: (req, file, cb) => {

        if (file.mimetype === "application/pdf") {

            cb(null, true);

        } else {

            cb(new Error("Only PDF files are allowed."));

        }

    }

});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/skill-gap', skillGapRoutes);
app.use(
    '/api/no-show',
    noShowBlacklistRoutes
);
app.get('/question-vault.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Company-Specific Question.html'));
});

app.get('/question-vault', (req, res) => {
    res.redirect('/question-vault.html');
});

app.get('/ask-an-alumnus', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ask-an-alumnus.html'));
});

app.post('/api/verify-alumni', (req, res) => {

    const { studentId, gradYear } = req.body;

    try {

        const rawData = fs.readFileSync('./mockUniversityDB.json');
        const universityDatabase = JSON.parse(rawData);

        const recordFound = universityDatabase.find(
            student => student.studentId === studentId && student.gradYear === parseInt(gradYear)
        );

        if (recordFound) {

            return res.json({
                verified: true,
                message: "Match found! Status successfully updated to Verified Mentor."
            });

        } else {

            return res.status(404).json({
                verified: false,
                message: "Verification failed. No record found in university archives."
            });

        }

    } catch (error) {

        return res.status(500).json({
            verified: false,
            message: "Server configuration error."
        });

    }

});

// Resume Critique Request API

app.post("/api/resume-request", upload.single("resume"), (req, res) => {

    try {

        const resumePath = "./resumeRequests.json";

        const rawData = fs.readFileSync(resumePath);

        const requests = JSON.parse(rawData);

        const newRequest = {

            id: Date.now(),

            studentName: req.body.studentName,

            studentId: req.body.studentId,

            mentor: req.body.mentor,

            resume: req.file.filename,

            notes: req.body.notes,

            status: "Pending",

            feedback: ""

        };

        requests.push(newRequest);

        fs.writeFileSync(
            resumePath,
            JSON.stringify(requests, null, 2)
        );

        res.json({

            success: true,

            message: "Resume request submitted successfully."

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Failed to submit resume request."

        });

    }

});

// Get All Resume Requests

app.get("/api/resume-requests", (req, res) => {

    try {

        const requests = JSON.parse(
            fs.readFileSync("./resumeRequests.json")
        );

        res.json(requests);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to load resume requests."

        });

    }

});

// Submit Resume Feedback

app.post("/api/review-resume", express.json(), (req, res) => {

    try {

        const requests = JSON.parse(
            fs.readFileSync("./resumeRequests.json")
        );

        const request = requests.find(
            item => item.id == req.body.id
        );

        if (!request) {

            return res.status(404).json({

                success: false,

                message: "Request not found."

            });

        }

        request.feedback = req.body.feedback;

        request.status = "Reviewed";

        fs.writeFileSync(
            "./resumeRequests.json",
            JSON.stringify(requests, null, 2)
        );

        res.json({

            success: true,

            message: "Feedback submitted successfully."

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Failed to submit feedback."

        });

    }

});

//added by rabeya//
// ================================
// Interview Booking APIs
// ================================

// Get all bookings
app.get('/api/bookings', (req, res) => {

    try {

        const data = fs.readFileSync(bookingFile);

        const bookings = JSON.parse(data);

        res.json(bookings);

    }

    catch (error) {

        res.status(500).json({
            message: "Could not load bookings."
        });

    }

});

// Book a new interview slot
app.get("/api/bookings", (req, res) => {

    try {

        const bookings = JSON.parse(
            fs.readFileSync(bookingFile)
        );

        res.json(bookings);

    }

    catch (error) {

        res.status(500).json({
            message: "Unable to load bookings."
        });

    }

});

app.post('/api/book-slot', (req, res) => {

    const {
        studentName,
        studentId,
        mentor,
        time
    } = req.body;

    try {

        const blacklist =
            noShowBlacklistModel.getActiveBlacklist(
                studentId
            );

        if (blacklist) {

            const expiryDate =
                new Date(
                    blacklist.expiresAt
                ).toLocaleDateString(
                    'en-US',
                    {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }
                );

            return res.status(403).json({
                success: false,
                message:
                    `Booking unavailable. You are restricted from booking mock interviews until ${expiryDate} due to a previous no-show.`
            });
        }

        const data = fs.readFileSync(bookingFile);

        

        const bookings = JSON.parse(data);

        const alreadyBooked = bookings.find(
            booking =>
                booking.mentor === mentor &&
                booking.time === time
        );

        if (alreadyBooked) {

            return res.status(400).json({

                success: false,

                message: "This slot has already been booked."

            });

        }

        const newBooking = {

            id: Date.now(),

            studentName,

            studentId,

            mentor,

            time

        };

        bookings.push(newBooking);

        fs.writeFileSync(
            bookingFile,
            JSON.stringify(bookings, null, 2)
        );

        res.json({

            success: true,

            message: "Interview booked successfully."

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: "Server error."

        });

    }

});

// Resume Critique Request API

app.post("/api/resume-request", upload.single("resume"), (req, res) => {

    try {

        const resumePath = "./resumeRequests.json";

        const rawData = fs.readFileSync(resumePath);

        const requests = JSON.parse(rawData);

        const newRequest = {

            id: Date.now(),

            studentName: req.body.studentName,

            studentId: req.body.studentId,

            mentor: req.body.mentor,

            resume: req.file.filename,

            notes: req.body.notes,

            status: "Pending",

            feedback: ""

        };

        requests.push(newRequest);

        fs.writeFileSync(
            resumePath,
            JSON.stringify(requests, null, 2)
        );

        res.json({

            success: true,

            message: "Resume request submitted successfully."

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Failed to submit resume request."

        });

    }

});

// Get All Resume Requests

app.get("/api/resume-requests", (req, res) => {

    try {

        const requests = JSON.parse(
            fs.readFileSync("./resumeRequests.json")
        );

        res.json(requests);

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            message: "Failed to load resume requests."

        });

    }

});

// Submit Resume Feedback

app.post("/api/review-resume", express.json(), (req, res) => {

    try {

        const requests = JSON.parse(
            fs.readFileSync("./resumeRequests.json")
        );

        const request = requests.find(
            item => item.id == req.body.id
        );

        if (!request) {

            return res.status(404).json({

                success: false,

                message: "Request not found."

            });

        }

        request.feedback = req.body.feedback;

        request.status = "Reviewed";

        fs.writeFileSync(
            "./resumeRequests.json",
            JSON.stringify(requests, null, 2)
        );

        res.json({

            success: true,

            message: "Feedback submitted successfully."

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Failed to submit feedback."

        });

    }

});

//added by rabeya//
// ================================
// Interview Booking APIs
// ================================

// Get all bookings
app.get('/api/bookings', (req, res) => {

    try {

        const data = fs.readFileSync(bookingFile);

        const bookings = JSON.parse(data);

        res.json(bookings);

    }

    catch (error) {

        res.status(500).json({
            message: "Could not load bookings."
        });

    }

});

// Book a new interview slot
app.get("/api/bookings", (req, res) => {

    try {

        const bookings = JSON.parse(
            fs.readFileSync(bookingFile)
        );

        res.json(bookings);

    }

    catch (error) {

        res.status(500).json({
            message: "Unable to load bookings."
        });

    }

});

app.post('/api/book-slot', (req, res) => {

    const {
        studentName,
        studentId,
        mentor,
        time
    } = req.body;

    try {

        const data = fs.readFileSync(bookingFile);

        const bookings = JSON.parse(data);

        const alreadyBooked = bookings.find(
            booking =>
                booking.mentor === mentor &&
                booking.time === time
        );

        if (alreadyBooked) {

            return res.status(400).json({

                success: false,

                message: "This slot has already been booked."

            });

        }

        const newBooking = {

            id: Date.now(),

            studentName,

            studentId,

            mentor,

            time

        };

        bookings.push(newBooking);

        fs.writeFileSync(
            bookingFile,
            JSON.stringify(bookings, null, 2)
        );

        res.json({

            success: true,

            message: "Interview booked successfully."

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: "Server error."

        });

    }

});
// ================================
// Interview Evaluation API
// ================================

app.post('/api/interview-evaluation', (req, res) => {

    const {
        bookingId,
        sections,
        feedback
    } = req.body;

    try {

        // Make sure evaluation file exists
        if (!fs.existsSync(evaluationFile)) {
            fs.writeFileSync(evaluationFile, '[]');
        }

        const evaluations = JSON.parse(
            fs.readFileSync(evaluationFile)
        );

        // Find the original booking
        const bookings = JSON.parse(
            fs.readFileSync(bookingFile)
        );

        const booking = bookings.find(
            item => item.id == bookingId
        );

        if (!booking) {

            return res.status(404).json({
                success: false,
                message: "Interview booking not found."
            });

        }

        // Validate sections
        if (!sections || sections.length === 0) {

            return res.status(400).json({
                success: false,
                message: "Please add at least one assessment section."
            });

        }

        // Calculate average score out of 10
        const totalScore = sections.reduce(
            (sum, section) => sum + Number(section.score),
            0
        );

        const overallScore =
            Math.round((totalScore / sections.length) * 10) / 10;

        const evaluation = {

            id: Date.now(),

            bookingId: booking.id,

            studentName: booking.studentName,

            studentId: booking.studentId,

            mentor: booking.mentor,

            time: booking.time,

            sections: sections,

            overallScore: overallScore,

            feedback: feedback || "",

            status: "Evaluated"

        };

        evaluations.push(evaluation);

        fs.writeFileSync(
            evaluationFile,
            JSON.stringify(evaluations, null, 2)
        );

        res.json({

            success: true,

            message: "Interview evaluation submitted successfully.",

            overallScore: overallScore

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: "Failed to submit interview evaluation."

        });

    }

});
    
// ================================
// Alumni Career Profile Directory APIs
// ================================

// Get all alumni career profiles (supports optional query filters)
app.get('/api/alumni-profiles', (req, res) => {
    try {
        if (!fs.existsSync(alumniProfilesFile)) {
            fs.writeFileSync(alumniProfilesFile, '[]');
        }

        const data = fs.readFileSync(alumniProfilesFile, 'utf8');
        let profiles = JSON.parse(data || '[]');

        const { search, year, major, company, job, industry } = req.query;

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

        res.json(profiles);
    } catch (error) {
        console.error('Error fetching alumni profiles:', error);
        res.status(500).json({
            success: false,
            message: "Failed to load alumni career profiles."
        });
    }
});

// Add a new alumni career profile
app.post('/api/alumni-profiles', (req, res) => {
    try {
        const {
            name,
            studentId,
            gradYear,
            major,
            company,
            jobTitle,
            industry,
            linkedin,
            email,
            skills
        } = req.body;

        // Validation of required fields
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Alumni full name is required."
            });
        }

        if (!gradYear) {
            return res.status(400).json({
                success: false,
                message: "Graduation year is required."
            });
        }

        if (!major || !major.trim()) {
            return res.status(400).json({
                success: false,
                message: "Specific major is required."
            });
        }

        if (!company || !company.trim()) {
            return res.status(400).json({
                success: false,
                message: "Current employer / company is required."
            });
        }

        if (!jobTitle || !jobTitle.trim()) {
            return res.status(400).json({
                success: false,
                message: "Industry job title is required."
            });
        }

        if (!fs.existsSync(alumniProfilesFile)) {
            fs.writeFileSync(alumniProfilesFile, '[]');
        }

        const rawData = fs.readFileSync(alumniProfilesFile, 'utf8');
        const profiles = JSON.parse(rawData || '[]');

        // Check if student record exists in mockUniversityDB.json
        let isVerified = true;
        try {
            if (fs.existsSync('./mockUniversityDB.json') && studentId) {
                const uniData = JSON.parse(fs.readFileSync('./mockUniversityDB.json', 'utf8'));
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

        // Parse skills array if provided as string or array
        let parsedSkills = [];
        if (Array.isArray(skills)) {
            parsedSkills = skills.map(s => String(s).trim()).filter(Boolean);
        } else if (typeof skills === 'string' && skills.trim()) {
            parsedSkills = skills.split(',').map(s => s.trim()).filter(Boolean);
        }

        const newProfile = {
            id: Date.now(),
            name: name.trim(),
            studentId: studentId ? studentId.trim() : "",
            gradYear: parseInt(gradYear) || Number(gradYear),
            major: major.trim(),
            company: company.trim(),
            jobTitle: jobTitle.trim(),
            industry: industry ? industry.trim() : "Technology / Other",
            linkedin: linkedin ? linkedin.trim() : "",
            email: email ? email.trim() : "",
            skills: parsedSkills,
            verified: isVerified,
            createdAt: new Date().toISOString()
        };

        // Add to beginning of profiles
        profiles.unshift(newProfile);

        fs.writeFileSync(
            alumniProfilesFile,
            JSON.stringify(profiles, null, 2)
        );

        res.status(201).json({
            success: true,
            message: "Alumni career profile added successfully to the directory!",
            profile: newProfile
        });

    } catch (error) {
        console.error('Error saving alumni profile:', error);
        res.status(500).json({
            success: false,
            message: "Failed to add alumni career profile."
        });
    }
});

// Update an existing alumni career profile
app.put('/api/alumni-profiles/:id', (req, res) => {
    try {
        const profileId = req.params.id;
        const {
            name,
            studentId,
            gradYear,
            major,
            company,
            jobTitle,
            industry,
            linkedin,
            email,
            skills
        } = req.body;

        // Validation of required fields
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Alumni full name is required."
            });
        }

        if (!gradYear) {
            return res.status(400).json({
                success: false,
                message: "Graduation year is required."
            });
        }

        if (!major || !major.trim()) {
            return res.status(400).json({
                success: false,
                message: "Specific major is required."
            });
        }

        if (!company || !company.trim()) {
            return res.status(400).json({
                success: false,
                message: "Current employer / company is required."
            });
        }

        if (!jobTitle || !jobTitle.trim()) {
            return res.status(400).json({
                success: false,
                message: "Industry job title is required."
            });
        }

        if (!fs.existsSync(alumniProfilesFile)) {
            return res.status(404).json({
                success: false,
                message: "Alumni profiles database not found."
            });
        }

        const rawData = fs.readFileSync(alumniProfilesFile, 'utf8');
        const profiles = JSON.parse(rawData || '[]');

        const profileIndex = profiles.findIndex(p => String(p.id) === String(profileId));

        if (profileIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Alumni career profile not found."
            });
        }

        // Parse skills array
        let parsedSkills = [];
        if (Array.isArray(skills)) {
            parsedSkills = skills.map(s => String(s).trim()).filter(Boolean);
        } else if (typeof skills === 'string' && skills.trim()) {
            parsedSkills = skills.split(',').map(s => s.trim()).filter(Boolean);
        }

        const existing = profiles[profileIndex];
        const updatedProfile = {
            ...existing,
            name: name.trim(),
            studentId: studentId ? studentId.trim() : (existing.studentId || ""),
            gradYear: parseInt(gradYear) || Number(gradYear),
            major: major.trim(),
            company: company.trim(),
            jobTitle: jobTitle.trim(),
            industry: industry ? industry.trim() : (existing.industry || "Technology / Other"),
            linkedin: linkedin !== undefined ? linkedin.trim() : (existing.linkedin || ""),
            email: email !== undefined ? email.trim() : (existing.email || ""),
            skills: parsedSkills,
            updatedAt: new Date().toISOString()
        };

        profiles[profileIndex] = updatedProfile;

        fs.writeFileSync(
            alumniProfilesFile,
            JSON.stringify(profiles, null, 2)
        );

        res.json({
            success: true,
            message: "Alumni career profile updated successfully!",
            profile: updatedProfile
        });

    } catch (error) {
        console.error('Error updating alumni profile:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update alumni career profile."
        });
    }
});

// Delete an alumni career profile
app.delete('/api/alumni-profiles/:id', (req, res) => {
    try {
        const profileId = req.params.id;

        if (!fs.existsSync(alumniProfilesFile)) {
            return res.status(404).json({
                success: false,
                message: "Alumni profiles database not found."
            });
        }

        const rawData = fs.readFileSync(alumniProfilesFile, 'utf8');
        const profiles = JSON.parse(rawData || '[]');

        const profileIndex = profiles.findIndex(p => String(p.id) === String(profileId));

        if (profileIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Alumni career profile not found."
            });
        }

        const deletedProfile = profiles.splice(profileIndex, 1)[0];

        fs.writeFileSync(
            alumniProfilesFile,
            JSON.stringify(profiles, null, 2)
        );

        res.json({
            success: true,
            message: `Alumni profile for ${deletedProfile.name} has been deleted successfully.`
        });

    } catch (error) {
        console.error('Error deleting alumni profile:', error);
        res.status(500).json({
            success: false,
            message: "Failed to delete alumni career profile."
        });
    }
});

// ================================
// Exclusive Alumni Referral Job Board APIs
// ================================

// Get all referral jobs (supports optional query filters)
app.get('/api/referral-jobs', (req, res) => {
    try {
        if (!fs.existsSync(referralJobsFile)) {
            fs.writeFileSync(referralJobsFile, '[]');
        }

        const data = fs.readFileSync(referralJobsFile, 'utf8');
        let jobs = JSON.parse(data || '[]');

        const { search, type, major } = req.query;

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

        res.json(jobs);
    } catch (error) {
        console.error('Error fetching referral jobs:', error);
        res.status(500).json({
            success: false,
            message: "Failed to load referral jobs."
        });
    }
});

// Post a new referral job
app.post('/api/referral-jobs', (req, res) => {
    try {
        const {
            title,
            company,
            type,
            major,
            location,
            description,
            applyLink,
            postedBy,
            postedYear
        } = req.body;

        // Validation of required fields
        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Job title is required."
            });
        }

        if (!company || !company.trim()) {
            return res.status(400).json({
                success: false,
                message: "Company name is required."
            });
        }

        if (!type || !type.trim()) {
            return res.status(400).json({
                success: false,
                message: "Job type is required."
            });
        }

        if (!major || !major.trim()) {
            return res.status(400).json({
                success: false,
                message: "Target major is required."
            });
        }

        if (!description || !description.trim()) {
            return res.status(400).json({
                success: false,
                message: "Job description is required."
            });
        }

        if (!fs.existsSync(referralJobsFile)) {
            fs.writeFileSync(referralJobsFile, '[]');
        }

        const rawData = fs.readFileSync(referralJobsFile, 'utf8');
        const jobs = JSON.parse(rawData || '[]');

        const newJob = {
            id: Date.now(),
            title: title.trim(),
            company: company.trim(),
            type: type.trim(),
            major: major.trim(),
            location: location ? location.trim() : "Dhaka, Bangladesh",
            description: description.trim(),
            applyLink: applyLink ? applyLink.trim() : "#",
            postedBy: postedBy ? postedBy.trim() : "Verified Alumni",
            postedYear: postedYear ? String(postedYear) : "2025",
            verified: true,
            createdAt: new Date().toISOString()
        };

        // Add to beginning of list
        jobs.unshift(newJob);

        fs.writeFileSync(
            referralJobsFile,
            JSON.stringify(jobs, null, 2)
        );

        res.status(201).json({
            success: true,
            message: "Referral job posted successfully!",
            job: newJob
        });

    } catch (error) {
        console.error('Error saving referral job:', error);
        res.status(500).json({
            success: false,
            message: "Failed to post referral job."
        });
    }
});

// Delete a referral job
app.delete('/api/referral-jobs/:id', (req, res) => {
    try {
        const jobId = req.params.id;

        if (!fs.existsSync(referralJobsFile)) {
            return res.status(404).json({
                success: false,
                message: "Referral jobs database not found."
            });
        }

        const rawData = fs.readFileSync(referralJobsFile, 'utf8');
        const jobs = JSON.parse(rawData || '[]');

        const jobIndex = jobs.findIndex(j => String(j.id) === String(jobId));

        if (jobIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Job listing not found."
            });
        }

        const deleted = jobs.splice(jobIndex, 1)[0];

        fs.writeFileSync(
            referralJobsFile,
            JSON.stringify(jobs, null, 2)
        );

        res.json({
            success: true,
            message: `Job listing "${deleted.title}" deleted successfully.`
        });

    } catch (error) {
        console.error('Error deleting referral job:', error);
        res.status(500).json({
            success: false,
            message: "Failed to delete job listing."
        });
    }
});

// ================================
// Student Mock-Interview Readiness Progress Tracker API
// ================================

app.get('/api/mock-interviews', (req, res) => {
    try {
        if (!fs.existsSync(mockInterviewDataFile)) {
            fs.writeFileSync(mockInterviewDataFile, '[]');
        }

        const data = fs.readFileSync(mockInterviewDataFile, 'utf8');
        let records = JSON.parse(data || '[]');

        const { studentId } = req.query;

        if (studentId) {
            records = records.filter(r => String(r.studentId) === String(studentId));
        }

        res.json(records);
    } catch (error) {
        console.error('Error fetching mock interview data:', error);
        res.status(500).json({ error: 'Failed to fetch mock interview data.' });
    }
});

// ================================
// Ask an Alumnus Discussion Forum APIs
// ================================

// Helper to read forum questions safely
function getForumData() {
    if (!fs.existsSync(askAlumnusDataFile)) {
        fs.writeFileSync(askAlumnusDataFile, JSON.stringify({ questions: [] }, null, 2));
    }
    const raw = fs.readFileSync(askAlumnusDataFile, 'utf8');
    const parsed = JSON.parse(raw || '{"questions":[]}');
    return Array.isArray(parsed) ? { questions: parsed } : (parsed.questions ? parsed : { questions: [] });
}

// Helper to save forum data
function saveForumData(data) {
    fs.writeFileSync(askAlumnusDataFile, JSON.stringify(data, null, 2));
}

// Get all forum questions (with search, category, status, student filters)
app.get('/api/alumnus-questions', (req, res) => {
    try {
        const forumData = getForumData();
        let questions = forumData.questions || [];

        const { search, category, studentId, status } = req.query;

        if (search) {
            const s = search.toLowerCase().trim();
            questions = questions.filter(q =>
                (q.title && q.title.toLowerCase().includes(s)) ||
                (q.description && q.description.toLowerCase().includes(s)) ||
                (q.category && q.category.toLowerCase().includes(s)) ||
                (q.studentName && q.studentName.toLowerCase().includes(s)) ||
                (Array.isArray(q.replies) && q.replies.some(r =>
                    (r.reply && r.reply.toLowerCase().includes(s)) ||
                    (r.alumniName && r.alumniName.toLowerCase().includes(s)) ||
                    (r.company && r.company.toLowerCase().includes(s)) ||
                    (r.jobTitle && r.jobTitle.toLowerCase().includes(s))
                ))
            );
        }

        if (category && category !== 'All') {
            questions = questions.filter(q => q.category && q.category.toLowerCase() === category.toLowerCase());
        }

        if (studentId) {
            questions = questions.filter(q => String(q.studentId) === String(studentId));
        }

        if (status === 'unanswered') {
            questions = questions.filter(q => !q.replies || q.replies.length === 0);
        } else if (status === 'answered') {
            questions = questions.filter(q => q.replies && q.replies.length > 0);
        }

        res.json(questions);
    } catch (error) {
        console.error('Error fetching alumnus questions:', error);
        res.status(500).json({
            success: false,
            message: "Failed to load alumnus discussion questions."
        });
    }
});

// Get a single question thread by questionId
app.get('/api/alumnus-questions/:id', (req, res) => {
    try {
        const forumData = getForumData();
        const question = (forumData.questions || []).find(q => String(q.questionId) === String(req.params.id));

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Discussion question not found."
            });
        }

        res.json(question);
    } catch (error) {
        console.error('Error fetching question details:', error);
        res.status(500).json({
            success: false,
            message: "Failed to load discussion details."
        });
    }
});

// Post a new question
app.post('/api/alumnus-questions', (req, res) => {
    try {
        const { studentName, studentId, category, title, description } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Question title is required."
            });
        }

        if (!description || !description.trim()) {
            return res.status(400).json({
                success: false,
                message: "Question description is required."
            });
        }

        const forumData = getForumData();
        if (!forumData.questions) forumData.questions = [];

        const newQuestion = {
            questionId: `Q-${Date.now()}`,
            studentId: studentId ? String(studentId).trim() : "22201594",
            studentName: studentName ? studentName.trim() : "Student",
            title: title.trim(),
            description: description.trim(),
            category: category ? category.trim() : "General",
            date: new Date().toISOString().split('T')[0],
            replies: []
        };

        // Add to top of list
        forumData.questions.unshift(newQuestion);
        saveForumData(forumData);

        res.status(201).json({
            success: true,
            message: "Your question has been posted successfully!",
            question: newQuestion
        });
    } catch (error) {
        console.error('Error posting alumnus question:', error);
        res.status(500).json({
            success: false,
            message: "Failed to post question."
        });
    }
});

// Post a reply to a question
app.post('/api/alumnus-questions/:id/replies', (req, res) => {
    try {
        const questionId = req.params.id;
        const { alumniName, alumniId, jobTitle, company, reply, verified } = req.body;

        if (!reply || !reply.trim()) {
            return res.status(400).json({
                success: false,
                message: "Reply content is required."
            });
        }

        const forumData = getForumData();
        const questionIndex = (forumData.questions || []).findIndex(q => String(q.questionId) === String(questionId));

        if (questionIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Question not found."
            });
        }

        const targetQuestion = forumData.questions[questionIndex];
        if (!Array.isArray(targetQuestion.replies)) {
            targetQuestion.replies = [];
        }

        // Determine verification status
        let isVerified = verified !== undefined ? Boolean(verified) : true;
        try {
            if (fs.existsSync(alumniProfilesFile) && alumniName) {
                const profiles = JSON.parse(fs.readFileSync(alumniProfilesFile, 'utf8') || '[]');
                const found = profiles.find(p => p.name && p.name.toLowerCase() === alumniName.trim().toLowerCase());
                if (found) isVerified = Boolean(found.verified);
            }
        } catch (e) {
            console.warn('Alumni verification check warning:', e.message);
        }

        const newReply = {
            replyId: `R-${Date.now()}`,
            alumniId: alumniId ? String(alumniId).trim() : `AL-${Date.now().toString().slice(-4)}`,
            alumniName: alumniName ? alumniName.trim() : "Verified Alumni Mentor",
            jobTitle: jobTitle ? jobTitle.trim() : "Software Professional",
            company: company ? company.trim() : "Tech Industry",
            verified: isVerified,
            reply: reply.trim(),
            date: new Date().toISOString().split('T')[0]
        };

        targetQuestion.replies.push(newReply);
        saveForumData(forumData);

        res.status(201).json({
            success: true,
            message: "Your reply has been posted to the discussion thread!",
            reply: newReply,
            question: targetQuestion
        });
    } catch (error) {
        console.error('Error posting reply:', error);
        res.status(500).json({
            success: false,
            message: "Failed to post reply."
        });
    }
});

// Delete a question
app.delete('/api/alumnus-questions/:id', (req, res) => {
    try {
        const questionId = req.params.id;
        const forumData = getForumData();
        const initialLength = (forumData.questions || []).length;

        forumData.questions = (forumData.questions || []).filter(q => String(q.questionId) !== String(questionId));

        if (forumData.questions.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: "Question not found."
            });
        }

        saveForumData(forumData);

        res.json({
            success: true,
            message: "Discussion question deleted successfully."
        });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({
            success: false,
            message: "Failed to delete question."
        });
    }
});

// Delete a reply from a question
app.delete('/api/alumnus-questions/:questionId/replies/:replyId', (req, res) => {
    try {
        const { questionId, replyId } = req.params;
        const forumData = getForumData();
        const question = (forumData.questions || []).find(q => String(q.questionId) === String(questionId));

        if (!question) {
            return res.status(404).json({
                success: false,
                message: "Question not found."
            });
        }

        if (!Array.isArray(question.replies)) {
            return res.status(404).json({
                success: false,
                message: "Reply not found."
            });
        }

        const initialReplyCount = question.replies.length;
        question.replies = question.replies.filter(r => String(r.replyId) !== String(replyId));

        if (question.replies.length === initialReplyCount) {
            return res.status(404).json({
                success: false,
                message: "Reply not found."
            });
        }

        saveForumData(forumData);

        res.json({
            success: true,
            message: "Reply deleted successfully."
        });
    } catch (error) {
        console.error('Error deleting reply:', error);
        res.status(500).json({
            success: false,
            message: "Failed to delete reply."
        });
    }
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});