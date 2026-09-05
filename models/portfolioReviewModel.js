const fs = require('fs');
const path = require('path');

const reviewFile = path.join(__dirname, '..', 'portfolioReviewData.json');
const validReviewTypes = ['Architecture', 'UI/UX Design', 'Code Quality', 'Full Review'];

function readReviews() {
    if (!fs.existsSync(reviewFile)) {
        fs.writeFileSync(reviewFile, '[]');
    }

    return JSON.parse(fs.readFileSync(reviewFile, 'utf8') || '[]');
}

function saveReviews(reviews) {
    fs.writeFileSync(reviewFile, JSON.stringify(reviews, null, 2));
}

function normalizeUrl(value) {
    const url = String(value || '').trim();
    if (!/^https?:\/\/[^\s]+$/i.test(url)) {
        const error = new Error('Enter a valid live project URL beginning with http:// or https://.');
        error.statusCode = 400;
        throw error;
    }
    return url;
}

function getQueue() {
    return readReviews().sort((left, right) => {
        const statusOrder = { Submitted: 0, 'In Review': 1, Reviewed: 2 };
        const statusDifference = (statusOrder[left.status] ?? 3) - (statusOrder[right.status] ?? 3);
        return statusDifference || Number(right.createdAt) - Number(left.createdAt);
    });
}

function createReview(details) {
    const studentName = String(details.studentName || '').trim();
    const studentId = String(details.studentId || '').trim();
    const projectName = String(details.projectName || '').trim();
    const description = String(details.description || '').trim();
    const reviewType = String(details.reviewType || '').trim();

    if (!studentName || !studentId || !projectName || !description || !reviewType) {
        const error = new Error('Student details, project name, description, and review focus are required.');
        error.statusCode = 400;
        throw error;
    }

    if (!validReviewTypes.includes(reviewType)) {
        const error = new Error('Choose a valid review focus.');
        error.statusCode = 400;
        throw error;
    }

    const reviews = readReviews();
    const duplicate = reviews.find(review => review.studentId === studentId && review.projectUrl === details.projectUrl && review.status !== 'Reviewed');
    if (duplicate) {
        const error = new Error('This active project already has a pending review request.');
        error.statusCode = 409;
        throw error;
    }

    const review = {
        id: Date.now(),
        studentName,
        studentId,
        projectName,
        projectUrl: normalizeUrl(details.projectUrl),
        repositoryUrl: details.repositoryUrl ? normalizeUrl(details.repositoryUrl) : null,
        description,
        reviewType,
        status: 'Submitted',
        feedback: '',
        createdAt: Date.now(),
        reviewedAt: null
    };

    reviews.push(review);
    saveReviews(reviews);
    return review;
}

function updateReview(id, feedback, status) {
    const reviews = readReviews();
    const review = reviews.find(item => String(item.id) === String(id));

    if (!review) {
        const error = new Error('Portfolio review request not found.');
        error.statusCode = 404;
        throw error;
    }

    const normalizedFeedback = String(feedback || '').trim();
    if (!normalizedFeedback) {
        const error = new Error('Feedback is required to complete a review.');
        error.statusCode = 400;
        throw error;
    }

    review.feedback = normalizedFeedback;
    review.status = status === 'In Review' ? 'In Review' : 'Reviewed';
    review.reviewedAt = review.status === 'Reviewed' ? Date.now() : null;
    saveReviews(reviews);
    return review;
}

module.exports = { getQueue, createReview, updateReview };
