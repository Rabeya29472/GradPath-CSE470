const fs = require('fs');
const path = require('path');

const questionFile = path.join(__dirname, '..', 'questionVaultData.json');
const seedQuestions = [
    { id: 1, company: 'Google', role: 'Software Engineer', question: 'Design a distributed key-value store with low latency and high availability. How would you handle network partitions?', difficulty: 'Hard', topic: 'System Design', experience: 'They focused heavily on consistency models and fault tolerance.', postedBy: 'Sarah Ahmed', postedYear: '2020', verified: true, date: '2026-07-15', helpful: 0 },
    { id: 2, company: 'Microsoft', role: 'Software Engineer', question: 'Implement a LRU Cache using a combination of HashMap and Doubly Linked List. Write code in any language.', difficulty: 'Medium', topic: 'Data Structures', experience: 'They wanted a complete working solution with proper explanation.', postedBy: 'Ayan Khan', postedYear: '2023', verified: true, date: '2026-07-18', helpful: 0 },
    { id: 3, company: 'Google', role: 'Software Engineer', question: 'Write a function to find the longest substring without repeating characters. Explain the time and space complexity.', difficulty: 'Medium', topic: 'Algorithms', experience: 'This was the first coding round. They also asked about edge cases.', postedBy: 'Sarah Ahmed', postedYear: '2020', verified: true, date: '2026-07-20', helpful: 0 },
    { id: 4, company: 'Samsung R&D', role: 'Embedded Engineer', question: 'Explain the difference between RTOS and GPOS. How would you handle real-time constraints in embedded systems?', difficulty: 'Medium', topic: 'Embedded Systems', experience: 'They wanted practical examples from actual projects.', postedBy: 'Tanvir Islam', postedYear: '2022', verified: true, date: '2026-07-22', helpful: 0 },
    { id: 5, company: 'Mastercard', role: 'Business Analyst', question: 'How would you analyze a dataset to find fraudulent transactions? Walk me through your approach.', difficulty: 'Easy', topic: 'Data Analysis', experience: 'They wanted to see logical thinking and communication skills.', postedBy: 'Nabila Noor', postedYear: '2019', verified: true, date: '2026-07-23', helpful: 0 },
    { id: 6, company: 'Microsoft', role: 'Cloud Engineer', question: 'Design a scalable event-driven architecture using Azure Functions and Service Bus. How would you handle retries and failures?', difficulty: 'Hard', topic: 'Cloud Architecture', experience: 'This was for the Azure team. They wanted detailed architectural decisions.', postedBy: 'Ayan Khan', postedYear: '2023', verified: true, date: '2026-07-24', helpful: 0 }
];

function readQuestions() {
    if (!fs.existsSync(questionFile)) fs.writeFileSync(questionFile, JSON.stringify(seedQuestions, null, 2));
    const questions = JSON.parse(fs.readFileSync(questionFile, 'utf8') || '[]');
    if (!questions.length) {
        fs.writeFileSync(questionFile, JSON.stringify(seedQuestions, null, 2));
        return seedQuestions;
    }
    return questions;
}

function saveQuestions(questions) {
    fs.writeFileSync(questionFile, JSON.stringify(questions, null, 2));
}

function getQuestions() {
    return readQuestions().sort((left, right) => String(right.date).localeCompare(String(left.date)));
}

function createQuestion(details) {
    const required = ['company', 'role', 'question', 'difficulty'];
    if (required.some(field => !String(details[field] || '').trim())) {
        const error = new Error('Company, role, question, and difficulty are required.');
        error.statusCode = 400;
        throw error;
    }

    const questions = readQuestions();
    const question = {
        id: Date.now(),
        company: String(details.company).trim(),
        role: String(details.role).trim(),
        question: String(details.question).trim(),
        difficulty: String(details.difficulty).trim(),
        topic: String(details.topic || 'General').trim(),
        experience: String(details.experience || '').trim(),
        postedBy: String(details.postedBy || 'You (Verified Alumni)').trim(),
        postedYear: String(details.postedYear || new Date().getFullYear()),
        verified: details.verified !== false,
        date: new Date().toISOString().slice(0, 10),
        helpful: 0
    };
    questions.unshift(question);
    saveQuestions(questions);
    return question;
}

function markHelpful(id) {
    const questions = readQuestions();
    const question = questions.find(item => String(item.id) === String(id));
    if (!question) {
        const error = new Error('Question not found.');
        error.statusCode = 404;
        throw error;
    }
    question.helpful = Number(question.helpful || 0) + 1;
    saveQuestions(questions);
    return question;
}

module.exports = { getQuestions, createQuestion, markHelpful };
