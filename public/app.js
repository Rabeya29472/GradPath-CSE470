const GradPath = {
    getRole() {
        return localStorage.getItem('gradpathRole') || 'student';
    },

    setRole(role) {
        localStorage.setItem('gradpathRole', role);
        window.location.reload();
    },

    getStudentId() {
        return localStorage.getItem('gradpathStudentId') || '22201594';
    },

    setStudentId(studentId) {
        localStorage.setItem('gradpathStudentId', studentId);
    },

    getAlumniId() {
        return localStorage.getItem('gradpathAlumniId') || '';
    },

    setAlumniId(alumniId) {
        localStorage.setItem('gradpathAlumniId', alumniId);
    }
};

function buildSidebar(activePage = '') {
    const role = GradPath.getRole();

    const studentLinks = [
        ['index.html', 'Dashboard'],
        ['booking.html', 'Interview Booking'],
        ['resume.html', 'Resume Critique'],
        ['mentor-matchmaker.html', 'Mentor Matchmaker'],
        ['Company-Specific Question.html', 'Question Vault'],
        ['Exclusive_Alumni_Referral_Job_Board.html', 'Referral Job Board'],
        ['mock-interview-readiness.html', 'Interview Readiness'],
        ['skill-gap-results.html', 'Skill-Gap Results']
    ];

    const alumniLinks = [
        ['index.html', 'Dashboard'],
        ['mentor-hub.html', 'Mentor Hub'],
        ['mentor-sessions.html', 'Interview Sessions'],
        ['alumni-career-profile-directory.html', 'Career Directory'],
        ['resume.html', 'Resume Review'],
        ['skill-gap.html', 'Skill-Gap Assessment'],
        ['alumni-engagement-leaderboard.html', 'Engagement Leaderboard']
    ];

    const links = role === 'alumni'
        ? alumniLinks
        : studentLinks;

    const sidebar = document.getElementById('appSidebar');

    if (!sidebar) {
        return;
    }

    sidebar.innerHTML = `
        <div class="app-brand">
            GradPath
        </div>

        <div class="role-section">
            <div class="role-label">
                Current Role
            </div>

            <div class="role-toggle">
                <button
                    type="button"
                    class="${role === 'student' ? 'active' : ''}"
                    onclick="GradPath.setRole('student')"
                >
                    Student
                </button>

                <button
                    type="button"
                    class="${role === 'alumni' ? 'active' : ''}"
                    onclick="GradPath.setRole('alumni')"
                >
                    Alumni
                </button>
            </div>
        </div>

        <nav class="app-nav">
            ${links.map(([href, label]) => `
                <a
                    href="${href}"
                    class="${activePage === href ? 'active' : ''}"
                >
                    ${label}
                </a>
            `).join('')}
        </nav>
    `;
}