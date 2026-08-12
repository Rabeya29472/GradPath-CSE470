// Student Information

const studentName = document.getElementById("studentName");
const studentId = document.getElementById("studentId");
const mentor = document.getElementById("mentor");

// Resume Upload

const resumeFile = document.getElementById("resumeFile");
const selectedFile = document.getElementById("selectedFile");

// Notes

const notes = document.getElementById("notes");

// Submit Button

const submitBtn = document.getElementById("submitBtn");

// Show selected file name

resumeFile.addEventListener("change", () => {

    if (resumeFile.files.length > 0) {

        const file = resumeFile.files[0];

        selectedFile.innerHTML = "📄 " + file.name;

    }
    else {

        selectedFile.innerHTML = "No file selected";

    }

});

// Submit Request

submitBtn.addEventListener("click", () => {

    // Student Name

    if (studentName.value.trim() === "") {

        alert("Please enter your name.");

        return;

    }

    // Student ID

    if (studentId.value.trim() === "") {

        alert("Please enter your student ID.");

        return;

    }

    // Mentor

    if (mentor.value === "") {

        alert("Please select a mentor.");

        return;

    }

    // Resume

    if (resumeFile.files.length === 0) {

        alert("Please upload your resume.");

        return;

    }

    const file = resumeFile.files[0];

    // PDF Validation

    if (file.type !== "application/pdf") {

        alert("Only PDF files are allowed.");

        return;

    }

    // Size Validation (5 MB)

    if (file.size > 5 * 1024 * 1024) {

        alert("Resume must be smaller than 5 MB.");

        return;

    }

    

    const formData = new FormData();

formData.append("studentName", studentName.value);
formData.append("studentId", studentId.value);
formData.append("mentor", mentor.value);
formData.append("notes", notes.value);
formData.append("resume", file);

fetch("/api/resume-request", {

    method: "POST",

    body: formData

})

.then(response => response.json())

.then(data => {

    alert(data.message);

    if (data.success) {

        studentName.value = "";
        studentId.value = "";
        mentor.selectedIndex = 0;
        notes.value = "";
        resumeFile.value = "";

        selectedFile.innerHTML = "No file selected";

    }

})

.catch(error => {

    console.error(error);

    alert("Submission failed.");

});

});