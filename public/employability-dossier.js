const studentId = document.getElementById('studentId');
const previewBtn = document.getElementById('previewBtn');
const exportBtn = document.getElementById('exportBtn');
const message = document.getElementById('message');
const summary = document.getElementById('summary');
let loadedStudentId = '';

function showDossier(dossier) {
    loadedStudentId = dossier.studentId;
    document.getElementById('studentHeading').textContent = `${dossier.studentName} | ${dossier.targetRole}`;
    document.getElementById('scorecardCount').textContent = dossier.scorecards.length;
    document.getElementById('resumeCount').textContent = dossier.resumeVersions.length;
    document.getElementById('letterCount').textContent = dossier.recommendationLetters.length;
    document.getElementById('recordList').innerHTML = `<li>${dossier.major}</li><li>Packet includes reviewed records available as of ${dossier.generatedAt.slice(0, 10)}</li>`;
    summary.hidden = false;
    exportBtn.hidden = false;
}

previewBtn.addEventListener('click', async () => {
    const id = studentId.value.trim();
    if (!id) { message.textContent = 'Enter your student ID first.'; return; }
    message.textContent = 'Loading readiness records...';
    try {
        const response = await fetch(`/api/employability-dossier/${encodeURIComponent(id)}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        showDossier(data.dossier);
        message.textContent = 'Dossier preview ready.';
    } catch (error) { summary.hidden = true; exportBtn.hidden = true; message.textContent = error.message; }
});

exportBtn.addEventListener('click', () => { window.location.href = `/api/employability-dossier/${encodeURIComponent(loadedStudentId)}/export`; });
