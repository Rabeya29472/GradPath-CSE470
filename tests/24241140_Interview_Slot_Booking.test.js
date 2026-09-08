const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../server');

const bookingFile = path.join(__dirname, '..', 'bookingData.json');
const blacklistFile = path.join(
    __dirname,
    '..',
    'data',
    'noShowBlacklistData.json'
);

let originalBookings;
let originalBlacklist;

beforeAll(() => {
    originalBookings = fs.readFileSync(bookingFile, 'utf8');
    originalBlacklist = fs.readFileSync(blacklistFile, 'utf8');
});

afterAll(() => {
    fs.writeFileSync(
        bookingFile,
        originalBookings,
        'utf8'
    );

    fs.writeFileSync(
        blacklistFile,
        originalBlacklist,
        'utf8'
    );
});

describe('Interview Slot Booking API', () => {

    // Positive test: retrieve all bookings
    test('GET /api/bookings should return the bookings list', async () => {
    const response = await request(app)
        .get('/api/bookings');

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('mentor');
    expect(response.body[0]).toHaveProperty('time');
});

    // Positive test: book an available slot
    test('POST /api/book-slot should successfully book an available slot', async () => {
        const booking = {
            studentName: 'Test Student',
            studentId: 'TEST001',
            mentor: 'Sarah Ahmed (Software Engineer)',
            time: '10:00 AM'
        };

        const response = await request(app)
            .post('/api/book-slot')
            .send(booking);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message)
            .toBe('Interview booked successfully.');
    });

    // Negative test: duplicate slot
    test('POST /api/book-slot should reject an already booked slot', async () => {
        const duplicateBooking = {
            studentName: 'Another Student',
            studentId: 'TEST002',
            mentor: 'Sarah Ahmed (Software Engineer)',
            time: '11:30 AM'
        };

        const response = await request(app)
            .post('/api/book-slot')
            .send(duplicateBooking);

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message)
            .toBe('This slot has already been booked.');
    });

    // Security/boundary test: blacklisted student
    test('POST /api/book-slot should reject a student with an active no-show restriction', async () => {
        const blacklistData = [
            {
                studentId: 'BLACKLISTED001',
                reason: 'No-show',
                expiresAt: new Date(
                    Date.now() + 14 * 24 * 60 * 60 * 1000
                ).toISOString()
            }
        ];

        fs.writeFileSync(
            blacklistFile,
            JSON.stringify(blacklistData, null, 2),
            'utf8'
        );

        const booking = {
            studentName: 'Blacklisted Student',
            studentId: 'BLACKLISTED001',
            mentor: 'Tanvir Hasan (Data Scientist)',
            time: '10:30 AM'
        };

        const response = await request(app)
            .post('/api/book-slot')
            .send(booking);

        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message)
            .toContain('Booking unavailable');
        expect(response.body.message)
            .toContain('previous no-show');
    });
});