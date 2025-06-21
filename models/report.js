const express = require('express');
const router = express.Router();
const db = require('../db'); // Koneksi ke database

// Menampilkan halaman form laporan
router.get('/', (req, res) => {  // Perhatikan rute ini adalah '/' bukan '/report'
    res.render('report');  // Render file report.ejs
});

// Menangani pengiriman laporan
router.post('/', (req, res) => {
    const { name, email, subject, message } = req.body;

    const query = 'INSERT INTO reports (name, email, subject, message) VALUES (?, ?, ?, ?)';

    db.query(query, [name, email, subject, message], (err, result) => {
        if (err) {
            console.error('Error saving report:', err);
            return res.status(500).send('Error saving report');
        }

         // Setelah laporan disimpan, cek apakah user adalah organizer atau guest
        if (req.session.userId) {
            // Jika yang mengirim adalah organizer, redirect ke /dashboard
            res.redirect('/dashboard');
        } else {
            // Jika yang mengirim adalah guest, redirect ke halaman event
            res.redirect('/event');  // Bisa disesuaikan dengan halaman event yang sesuai
        }
    });
});

module.exports = router;
