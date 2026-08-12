const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 8000;

function readJsonFile(fileName) {
  const filePath = path.join(__dirname, fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJsonFile(fileName, data) {
  const filePath = path.join(__dirname, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/question-vault.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Company-Specific Question.html'));
});

app.get('/question-vault', (req, res) => {
  res.redirect('/question-vault.html');
});

app.post('/api/verify-alumni', (req, res) => {
  const { studentId, gradYear } = req.body;
  try {
    const universityDatabase = readJsonFile('mockUniversityDB.json');

    const recordFound = universityDatabase.find(
      student => student.studentId === studentId && student.gradYear === parseInt(gradYear, 10)
    );

    if (recordFound) {
      return res.json({ verified: true, message: "Match found! Status successfully updated to Verified Mentor." });
    } else {
      return res.status(404).json({ verified: false, message: "Verification failed. No record found in university archives." });
    }
  } catch (error) {
    return res.status(500).json({ verified: false, message: "Server configuration error." });
  }
});

app.get('/api/mentors', (req, res) => {
  try {
    const mentors = readJsonFile('mockMentorDB.json');
    return res.json(mentors);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load mentor records.' });
  }
});

app.get('/api/questions', (req, res) => {
  try {
    const questions = readJsonFile('mockQuestionDB.json');
    return res.json(questions);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load question records.' });
  }
});

app.post('/api/questions', (req, res) => {
  try {
    const questions = readJsonFile('mockQuestionDB.json');
    const newQuestion = req.body;

    if (!newQuestion || !newQuestion.company || !newQuestion.role || !newQuestion.question || !newQuestion.difficulty) {
      return res.status(400).json({ message: 'Missing required question fields.' });
    }

    const createdQuestion = {
      ...newQuestion,
      id: Date.now(),
      verified: newQuestion.verified ?? true,
      postedYear: newQuestion.postedYear || '2025',
      date: newQuestion.date || new Date().toISOString().split('T')[0],
      topic: newQuestion.topic || 'General'
    };

    questions.unshift(createdQuestion);
    writeJsonFile('mockQuestionDB.json', questions);
    return res.status(201).json(createdQuestion);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to save question.' });
  }
});

app.get('/api/jobs', (req, res) => {
  try {
    const jobs = readJsonFile('mockJobDB.json');
    return res.json(jobs);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load job records.' });
  }
});

app.post('/api/jobs', (req, res) => {
  try {
    const jobs = readJsonFile('mockJobDB.json');
    const newJob = req.body;

    if (!newJob || !newJob.title || !newJob.company || !newJob.type || !newJob.major || !newJob.description) {
      return res.status(400).json({ message: 'Missing required job fields.' });
    }

    const createdJob = {
      ...newJob,
      id: Date.now(),
      location: newJob.location || 'Not specified',
      applyLink: newJob.applyLink || '#',
      postedBy: newJob.postedBy || 'You (Verified Alumni)',
      postedYear: newJob.postedYear || '2025',
      verified: newJob.verified ?? true
    };

    jobs.unshift(createdJob);
    writeJsonFile('mockJobDB.json', jobs);
    return res.status(201).json(createdJob);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to save job.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});