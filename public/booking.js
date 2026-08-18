// Get all slot buttons
const slots = document.querySelectorAll(".slot");

// Selected slot display
const selectedText = document.getElementById("selectedText");

// Book button
const bookBtn = document.getElementById("bookBtn");

// Mentor dropdown
const mentorSelect = document.getElementById("mentor");

let selectedSlot = null;

// Select a slot
slots.forEach(slot => {

    slot.addEventListener("click", () => {

        // Remove previous selection
        slots.forEach(btn => {
            btn.classList.remove("selected");
        });

        // Highlight current slot
        slot.classList.add("selected");

        selectedSlot = slot.innerText;

        selectedText.innerHTML =
            `<strong>Mentor:</strong> ${mentorSelect.value || "Not Selected"} <br>
             <strong>Time:</strong> ${selectedSlot}`;

    });

});

// Book button
bookBtn.addEventListener("click", () => {

    if (mentorSelect.value === "") {
        alert("Please select a mentor.");
        return;
    }

    if (selectedSlot === null) {
        alert("Please select a time slot.");
        return;
    }

    const studentName =
        document.getElementById("studentName").value.trim();

    const studentId =
        document.getElementById("studentId").value.trim();

    if (studentName === "") {
        alert("Please enter your name.");
        return;
    }

    if (studentId === "") {
        alert("Please enter your student ID.");
        return;
    }

    fetch("/api/book-slot", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            studentName: studentName,
            studentId: studentId,
            mentor: mentorSelect.value,
            time: selectedSlot
        })
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
        })
        .catch(error => {
            alert("Booking failed.");
            console.error(error);
        });

});

// Update booked slots for the selected mentor
function updateBookedSlots() {

    fetch("/api/bookings")
        .then(response => response.json())
        .then(bookings => {

            // Reset all buttons first
            slots.forEach(slot => {

                slot.disabled = false;

                slot.classList.remove("booked");

                slot.innerText =
                    slot.innerText.replace(" (Booked)", "");

            });

            // Disable only the booked slots of the selected mentor
            bookings.forEach(booking => {

                if (booking.mentor === mentorSelect.value) {

                    slots.forEach(slot => {

                        if (slot.innerText === booking.time) {

                            slot.disabled = true;

                            slot.classList.add("booked");

                            slot.innerText =
                                booking.time + " (Booked)";

                        }

                    });

                }

            });

        });

}

// Whenever the mentor changes
mentorSelect.addEventListener("change", updateBookedSlots);

// Run once when the page loads
window.addEventListener("load", updateBookedSlots);