const queue = document.getElementById('reviewQueue');

function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

async function loadReviews() {
    try {
        const response = await fetch('/api/portfolio-reviews');
        const reviews = await response.json();
        if (!reviews.length) {
            queue.innerHTML = '<div class="empty-state">No portfolio projects are waiting for review.</div>';
            return;
        }
        queue.innerHTML = reviews.map(review => `
            <article class="review-card">
                <span class="status">${escapeHtml(review.status)}</span>
                <h3>${escapeHtml(review.projectName)}</h3>
                <p>${escapeHtml(review.description)}</p>
                <div class="review-meta">
                    <div><div class="meta-label">Student</div><div class="meta-value">${escapeHtml(review.studentName)}</div></div>
                    <div><div class="meta-label">Focus</div><div class="meta-value">${escapeHtml(review.reviewType)}</div></div>
                    <div><div class="meta-label">Student ID</div><div class="meta-value">${escapeHtml(review.studentId)}</div></div>
                </div>
                <div class="project-links"><a href="${escapeHtml(review.projectUrl)}" target="_blank" rel="noopener">Open Live Project</a>${review.repositoryUrl ? `<a href="${escapeHtml(review.repositoryUrl)}" target="_blank" rel="noopener">Open Repository</a>` : ''}</div>
                <div class="feedback-box">
                    <label for="feedback-${review.id}">Senior developer feedback</label>
                    <textarea id="feedback-${review.id}" rows="4" placeholder="Share specific architecture, design, or implementation feedback.">${escapeHtml(review.feedback || '')}</textarea>
                    <button data-review-id="${review.id}">Save Feedback</button>
                </div>
            </article>
        `).join('');
        queue.querySelectorAll('button[data-review-id]').forEach(button => button.addEventListener('click', () => saveFeedback(button.dataset.reviewId)));
    } catch (error) {
        queue.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
    }
}

async function saveFeedback(id) {
    const feedback = document.getElementById(`feedback-${id}`).value.trim();
    const response = await fetch(`/api/portfolio-reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback, status: 'Reviewed' })
    });
    const data = await response.json();
    alert(data.message);
    if (response.ok) loadReviews();
}

loadReviews();
