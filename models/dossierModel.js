const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const sources = {
    scorecards: path.join(root, 'mockInterviewData.json'),
    evaluations: path.join(root, 'interviewEvaluations.json'),
    resumes: path.join(root, 'resumeRequests.json'),
    recommendations: path.join(root, 'recommendationLetters.json')
};

function readJson(file, fallback) {
    if (!fs.existsSync(file)) {
        return fallback;
    }
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8') || JSON.stringify(fallback));
    } catch (error) {
        return fallback;
    }
}

function getDossier(studentId) {
    const id = String(studentId || '').trim();
    if (!id) {
        const error = new Error('Student ID is required.');
        error.statusCode = 400;
        throw error;
    }

    const scorecardRecords = readJson(sources.scorecards, []);
    const studentRecord = scorecardRecords.find(record => String(record.studentId) === id) || null;
    const evaluations = readJson(sources.evaluations, []).filter(item => String(item.studentId || item.studentId) === id);
    const resumeVersions = readJson(sources.resumes, []).filter(item => String(item.studentId) === id && item.status === 'Reviewed');
    const recommendationLetters = readJson(sources.recommendations, []).filter(item => String(item.studentId) === id && item.status !== 'Draft');

    if (!studentRecord && !resumeVersions.length && !evaluations.length && !recommendationLetters.length) {
        const error = new Error('No employability records were found for this student ID.');
        error.statusCode = 404;
        throw error;
    }

    return {
        studentId: id,
        studentName: studentRecord?.studentName || resumeVersions[0]?.studentName || recommendationLetters[0]?.studentName || 'Student',
        major: studentRecord?.major || 'Computer Science & Engineering (CSE)',
        targetRole: studentRecord?.targetRole || 'Software Engineering Candidate',
        scorecards: studentRecord?.mockInterviews || [],
        evaluations,
        resumeVersions,
        recommendationLetters,
        generatedAt: new Date().toISOString()
    };
}

function clean(value) {
    return String(value ?? '').replace(/[^\x20-\x7E]/g, '').replace(/[()\\]/g, character => `\\${character}`);
}

function dossierLines(dossier) {
    const lines = [
        'GRADPATH | EMPLOYABILITY READINESS DOSSIER',
        `Student: ${dossier.studentName}`,
        `Student ID: ${dossier.studentId}`,
        `Track: ${dossier.major} | Target role: ${dossier.targetRole}`,
        `Generated: ${dossier.generatedAt.slice(0, 10)}`,
        '',
        'MOCK INTERVIEW SCORECARDS'
    ];

    if (!dossier.scorecards.length) lines.push('No mock interview scorecards available.');
    dossier.scorecards.forEach(card => {
        lines.push(`${card.interviewId || 'Interview'} | ${card.date || 'Date unavailable'} | ${card.mentor || 'Mentor unavailable'}`);
        lines.push(`Type: ${card.interviewType || 'General'} | Overall score: ${card.overallScore ?? 'N/A'}`);
        lines.push(`Feedback: ${card.feedback || 'No feedback recorded.'}`);
        lines.push('');
    });

    lines.push('VERIFIED RESUME VERSIONS');
    if (!dossier.resumeVersions.length) lines.push('No reviewed resume versions available.');
    dossier.resumeVersions.forEach(resume => {
        lines.push(`${resume.resume || 'Resume file'} | Mentor: ${resume.mentor || 'N/A'} | Status: ${resume.status}`);
        lines.push(`Feedback: ${resume.feedback || 'No feedback recorded.'}`);
    });
    lines.push('', 'MENTOR RECOMMENDATION LETTERS');
    if (!dossier.recommendationLetters.length) lines.push('No recommendation letters available.');
    dossier.recommendationLetters.forEach(letter => {
        lines.push(`${letter.title || 'Recommendation'} | ${letter.mentor || 'Mentor unavailable'}`);
        lines.push(letter.content || 'No letter content recorded.');
        lines.push('');
    });

    return lines;
}

function buildPdf(dossier) {
    const lines = dossierLines(dossier);
    const pages = [];
    for (let index = 0; index < lines.length; index += 42) pages.push(lines.slice(index, index + 42));
    const objects = [];
    const addObject = content => { objects.push(content); return objects.length; };
    const catalog = addObject('<< /Type /Catalog /Pages 2 0 R >>');
    const pagesObject = addObject('');
    const font = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
    const pageIds = [];

    pages.forEach(pageLines => {
        const stream = ['BT', '/F1 10 Tf', '50 760 Td', '12 TL', ...pageLines.map(line => `(${clean(line).slice(0, 115)}) Tj T*`), 'ET'].join('\n');
        const streamId = addObject(`<< /Length ${Buffer.byteLength(stream, 'ascii')} >>\nstream\n${stream}\nendstream`);
        pageIds.push(addObject(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${font} 0 R >> >> /Contents ${streamId} 0 R >>`));
    });

    objects[pagesObject - 1] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    objects.forEach((object, index) => {
        offsets[index + 1] = Buffer.byteLength(pdf, 'ascii');
        pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });
    const xrefOffset = Buffer.byteLength(pdf, 'ascii');
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach(offset => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n`; });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return Buffer.from(pdf, 'ascii');
}

module.exports = { getDossier, buildPdf };
