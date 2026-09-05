const requestContainer = document.getElementById("requestContainer");

// Load all resume requests

fetch("/api/resume-requests")

.then(response => response.json())

.then(requests => {

    if (requests.length === 0) {

        requestContainer.innerHTML = "<h3>No resume requests found.</h3>";

        return;

    }

    requests.forEach(request => {

        const card = document.createElement("div");

        card.className = "request-card";

        const badgeColor =
            request.status === "Reviewed"
            ? "#dcfce7"
            : "#fef3c7";

        const badgeTextColor =
            request.status === "Reviewed"
            ? "#166534"
            : "#92400e";

        card.innerHTML = `

            <h3>${request.studentName}</h3>

            <p class="info"><strong>Student ID:</strong> ${request.studentId}</p>

            <p class="info"><strong>Mentor:</strong> ${request.mentor}</p>

            <p class="info">

                <strong>Resume:</strong>

                <a class="resume-link"

                   href="/uploads/${request.resume}"

                   target="_blank">

                    Open PDF

                </a>

            </p>

            <span
                class="status"
                style="background:${badgeColor};color:${badgeTextColor};">

                ${request.status}

            </span>

            <textarea
                id="feedback-${request.id}"
                placeholder="Write feedback here..."
            >${request.feedback}</textarea>

            <button onclick="submitFeedback(${request.id})">

                Submit Feedback

            </button>

        `;

        requestContainer.appendChild(card);

    });

});
// Submit mentor feedback

function submitFeedback(id) {

    const feedback = document.getElementById(`feedback-${id}`).value;

    if (feedback.trim() === "") {

        alert("Please enter feedback.");

        return;

    }

    fetch("/api/review-resume", {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            id: id,

            feedback: feedback

        })

    })

    .then(response => response.json())

    .then(data => {

        alert(data.message);

        if (data.success) {

            location.reload();

        }

    })

    .catch(error => {

        console.error(error);

        alert("Failed to submit feedback.");

    });

}