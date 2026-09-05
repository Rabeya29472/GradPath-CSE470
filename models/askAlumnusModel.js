const fs = require('fs');
const path = require('path');

const askAlumnusDataFile = path.join(__dirname, '..', 'askAlumnusData.json');
const alumniProfilesFile = path.join(__dirname, '..', 'alumniProfiles.json');

function readForumData() {
    if (!fs.existsSync(askAlumnusDataFile)) {
        fs.writeFileSync(askAlumnusDataFile, JSON.stringify({ questions: [] }, null, 2));
    }
    const raw = fs.readFileSync(askAlumnusDataFile, 'utf8');
    const parsed = JSON.parse(raw || '{"questions":[]}');
    return Array.isArray(parsed) ? { questions: parsed } : (parsed.questions ? parsed : { questions: [] });
}

function writeForumData(data) {
    fs.writeFileSync(askAlumnusDataFile, JSON.stringify(data, null, 2));
}

function getAllQuestions(filters) {
    const forumData = readForumData();
    let questions = forumData.questions || [];

    const { search, category, studentId, status } = filters || {};

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

    return questions;
}

function getQuestionById(questionId) {
    const forumData = readForumData();
    return (forumData.questions || []).find(q => String(q.questionId) === String(questionId)) || null;
}

function createQuestion(data) {
    const { studentName, studentId, category, title, description } = data;

    const forumData = readForumData();
    if (!forumData.questions) forumData.questions = [];

    const newQuestion = {
        questionId: `Q-${Date.now()}`,
        studentId: studentId ? String(studentId).trim() : '22201594',
        studentName: studentName ? studentName.trim() : 'Student',
        title: title.trim(),
        description: description.trim(),
        category: category ? category.trim() : 'General',
        date: new Date().toISOString().split('T')[0],
        replies: []
    };

    forumData.questions.unshift(newQuestion);
    writeForumData(forumData);
    return newQuestion;
}

function addReply(questionId, data) {
    const { alumniName, alumniId, jobTitle, company, reply, verified } = data;

    const forumData = readForumData();
    const questionIndex = (forumData.questions || []).findIndex(
        q => String(q.questionId) === String(questionId)
    );

    if (questionIndex === -1) {
        return null;
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
            const found = profiles.find(
                p => p.name && p.name.toLowerCase() === alumniName.trim().toLowerCase()
            );
            if (found) isVerified = Boolean(found.verified);
        }
    } catch (e) {
        console.warn('Alumni verification check warning:', e.message);
    }

    const newReply = {
        replyId: `R-${Date.now()}`,
        alumniId: alumniId ? String(alumniId).trim() : `AL-${Date.now().toString().slice(-4)}`,
        alumniName: alumniName ? alumniName.trim() : 'Verified Alumni Mentor',
        jobTitle: jobTitle ? jobTitle.trim() : 'Software Professional',
        company: company ? company.trim() : 'Tech Industry',
        verified: isVerified,
        reply: reply.trim(),
        date: new Date().toISOString().split('T')[0]
    };

    targetQuestion.replies.push(newReply);
    writeForumData(forumData);

    return { reply: newReply, question: targetQuestion };
}

function deleteQuestion(questionId) {
    const forumData = readForumData();
    const initialLength = (forumData.questions || []).length;

    forumData.questions = (forumData.questions || []).filter(
        q => String(q.questionId) !== String(questionId)
    );

    if (forumData.questions.length === initialLength) {
        return false;
    }

    writeForumData(forumData);
    return true;
}

function deleteReply(questionId, replyId) {
    const forumData = readForumData();
    const question = (forumData.questions || []).find(
        q => String(q.questionId) === String(questionId)
    );

    if (!question) {
        return { notFound: 'question' };
    }

    if (!Array.isArray(question.replies)) {
        return { notFound: 'reply' };
    }

    const initialReplyCount = question.replies.length;
    question.replies = question.replies.filter(r => String(r.replyId) !== String(replyId));

    if (question.replies.length === initialReplyCount) {
        return { notFound: 'reply' };
    }

    writeForumData(forumData);
    return { deleted: true };
}

module.exports = {
    getAllQuestions,
    getQuestionById,
    createQuestion,
    addReply,
    deleteQuestion,
    deleteReply
};
