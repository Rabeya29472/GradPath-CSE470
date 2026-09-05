const submitReview = document.getElementById('submitReview');
const statusMessage = document.getElementById('statusMessage');

submitReview.addEventListener('click', async () => {
    const payload = {
        studentName: document.getElementById('studentName').value.trim(),
        studentId: document.getElementById('studentId').value.trim(),
        projectName: document.getElementById('projectName').value.trim(),
        projectUrl: document.getElementById('projectUrl').value.trim(),
        repositoryUrl: document.getElementById('repositoryUrl').value.trim(),
        reviewType: document.getElementById('reviewType').value,
        description: document.getElementById('description').value.trim()
    };

    statusMessage.textContent = 'Submitting...';
    try {
        const response = await fetch('/api/portfolio-reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Submission failed.');
        statusMessage.textContent = data.message;
        document.querySelectorAll('input, textarea').forEach(field => { field.value = ''; });
        document.getElementById('reviewType').selectedIndex = 0;
    } catch (error) {
        statusMessage.textContent = error.message;
    }
});
