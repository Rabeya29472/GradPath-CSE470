const express = require('express');
const fs = require('fs');
const path = require('path');
const bookingFile = './bookingData.json'; //added by rabeya//
const app = express();
const PORT = 8000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/question-vault.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Company-Specific Question.html'));
});

app.get('/question-vault', (req, res) => {
  res.redirect('/question-vault.html');
});

app.post('/api/verify-alumni', (req, res) => {
  const { studentId, gradYear } = req.body;
  try {
    const rawData = fs.readFileSync('./mockUniversityDB.json');
    const universityDatabase = JSON.parse(rawData);

    const recordFound = universityDatabase.find(
      student => student.studentId === studentId && student.gradYear === parseInt(gradYear)
    );

    if (recordFound) {
      return res.json({ verified: true, message: "Match found! Status successfully updated to Verified Mentor." });
    } else {
      return res.status(404).json({ verified: false, message: "Verification failed. No record found in university archives." });
    }
  } catch (error) {
    return res.status(500).json({ verified: false, message: "Server configuration error." });
  }
});

//added by rabeya//
// ================================
// Interview Booking APIs
// ================================

// Get all bookings
app.get('/api/bookings', (req, res) => {

    try{

        const data = fs.readFileSync(bookingFile);

        const bookings = JSON.parse(data);

        res.json(bookings);

    }

    catch(error){

        res.status(500).json({
            message:"Could not load bookings."
        });

    }

});



// Book a new interview slot
app.get("/api/bookings", (req, res) => {

    try {

        const bookings = JSON.parse(
            fs.readFileSync(bookingFile)
        );

        res.json(bookings);

    }

    catch (error) {

        res.status(500).json({
            message: "Unable to load bookings."
        });

    }

});

app.post('/api/book-slot',(req,res)=>{

    const{

        mentor,

        time

    }=req.body;

    try{

        const data=fs.readFileSync(bookingFile);

        const bookings=JSON.parse(data);

        const alreadyBooked=bookings.find(

            booking=>

            booking.mentor===mentor &&

            booking.time===time

        );

        if(alreadyBooked){

            return res.status(400).json({

                success:false,

                message:"This slot has already been booked."

            });

        }

        const newBooking={

            id:Date.now(),

            mentor,

            time

        };

        bookings.push(newBooking);

        fs.writeFileSync(

            bookingFile,

            JSON.stringify(bookings,null,2)

        );

        res.json({

            success:true,

            message:"Interview booked successfully."

        });

    }

    catch(error){

        res.status(500).json({

            success:false,

            message:"Server error."

        });

    }

});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});