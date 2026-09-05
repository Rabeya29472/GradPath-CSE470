const studentId = "22201594";

async function loadAssessments() {
    const loading = document.getElementById("loading");
    const noResults = document.getElementById("noResults");
    const results = document.getElementById("results");

    try {
        const response = await fetch(
            `/api/skill-gap/assessments/student/${studentId}`
        );

        const data = await response.json();

        loading.style.display = "none";

        if (!response.ok || !data.success) {
            noResults.style.display = "block";
            return;
        }

        const assessments = data.assessments;

        if (!assessments || assessments.length === 0) {
            noResults.style.display = "block";
            return;
        }

        const firstAssessment = assessments[0];

        document.getElementById("studentId").textContent =
            firstAssessment.studentId;

        document.getElementById("studentMajor").textContent =
            firstAssessment.studentMajor;

        document.getElementById("studentYear").textContent =
            firstAssessment.studentGradYear;

        results.innerHTML = "";

        assessments.reverse().forEach(assessment => {
            const card = document.createElement("article");

            const date = new Date(
                assessment.createdAt
            ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
            });

            const skillsHTML = assessment.skillGaps
                .map(skill => `
                    <span class="skill">
                        ${skill}
                    </span>
                `)
                .join("");

            card.className = "assessment-card";

            card.innerHTML = `
                <div class="assessment-header">

                    <div>
                        <h2>Mentor Assessment</h2>

                        <div class="assessment-date">
                            Submitted on ${date}
                        </div>
                    </div>

                    <div class="mentor-label">
                        ${assessment.assessedBy}
                    </div>

                </div>

                <div class="section">

                    <div class="section-title">
                        Identified Skill Gaps
                    </div>

                    <div class="skills">
                        ${skillsHTML}
                    </div>

                </div>

                <div class="section">

                    <div class="section-title">
                        Mentor Recommendation
                    </div>

                    <div class="recommendation">
                        ${assessment.recommendation}
                    </div>

                </div>
            `;

            results.appendChild(card);
        });

        results.style.display = "block";

    } catch (error) {

        console.error(
            "Error loading skill-gap assessments:",
            error
        );

        loading.style.display = "none";
        noResults.style.display = "block";
    }
}

loadAssessments();