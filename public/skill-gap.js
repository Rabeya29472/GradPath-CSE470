let students = [];
let alumni = [];

async function loadData() {
    try {
        const [
            studentsResponse,
            alumniResponse
        ] = await Promise.all([
            fetch('/api/skill-gap/students'),
            fetch('/api/skill-gap/alumni')
        ]);

        students = await studentsResponse.json();
        alumni = await alumniResponse.json();

        populateStudents();
        populateAlumni();

    } catch (error) {
        console.error(
            'Unable to load Skill-Gap data:',
            error
        );
    }
}

function populateStudents() {
    const select =
        document.getElementById('studentSelect');

    students.forEach(student => {
        const option =
            document.createElement('option');

        option.value = student.studentId;

        option.textContent =
            `${student.studentId} — ${student.major} — Class of ${student.gradYear}`;

        select.appendChild(option);
    });
}

function populateAlumni() {
    const select =
        document.getElementById('alumniSelect');

    alumni.forEach(person => {
        const option =
            document.createElement('option');

        option.value = person.id;

        option.textContent =
            `${person.name} — ${person.jobTitle} at ${person.company}`;

        select.appendChild(option);
    });
}

document
    .getElementById('studentSelect')
    .addEventListener('change', function () {

        const studentId = this.value;

        const info =
            document.getElementById('studentInfo');

        if (!studentId) {
            info.style.display = 'none';
            return;
        }

        const student =
            students.find(
                item => item.studentId === studentId
            );

        if (student) {
            info.innerHTML = `
                <strong>Student ID:</strong>
                ${student.studentId}
                &nbsp;&nbsp;|&nbsp;&nbsp;

                <strong>Major:</strong>
                ${student.major}
                &nbsp;&nbsp;|&nbsp;&nbsp;

                <strong>Graduation:</strong>
                ${student.gradYear}
            `;

            info.style.display = 'block';
        }
    });

async function submitAssessment() {

    const studentId =
        document.getElementById(
            'studentSelect'
        ).value;

    const alumniId =
        document.getElementById(
            'alumniSelect'
        ).value;

    const recommendation =
        document.getElementById(
            'recommendation'
        ).value.trim();

    const skillGaps =
        Array.from(
            document.querySelectorAll(
                '.skill-option input:checked'
            )
        ).map(input => input.value);

    if (!studentId) {
        showMessage(
            'Please select a student.',
            'error'
        );
        return;
    }

    if (!alumniId) {
        showMessage(
            'Please select the alumni reviewer.',
            'error'
        );
        return;
    }

    if (skillGaps.length === 0) {
        showMessage(
            'Please select at least one skill gap.',
            'error'
        );
        return;
    }

    if (!recommendation) {
        showMessage(
            'Please provide a recommendation.',
            'error'
        );
        return;
    }

    try {

        const response =
            await fetch(
                '/api/skill-gap/assessments',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify({
                        studentId,
                        alumniId,
                        skillGaps,
                        recommendation
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {
            showMessage(
                data.message ||
                'Unable to submit assessment.',
                'error'
            );

            return;
        }

        showMessage(
            `Assessment submitted by ${data.assessment.alumniName}.`,
            'success'
        );

        document
            .getElementById('recommendation')
            .value = '';

        document
            .querySelectorAll(
                '.skill-option input'
            )
            .forEach(input => {
                input.checked = false;
            });

    } catch (error) {

        console.error(error);

        showMessage(
            'Unable to connect to the server.',
            'error'
        );
    }
}

function showMessage(text, type) {

    const message =
        document.getElementById('message');

    message.textContent = text;

    message.className =
        `message ${type}`;

    message.style.display = 'block';
}

loadData();