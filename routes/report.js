const express = require('express');
const router = express.Router();
const Report = require('../models/report');

// Menampilkan halaman form laporan
router.get('/report', (req, res) => {
    res.render('report');  // Render file report.ejs
});

// Menangani pengiriman laporan
router.post('/report', async (req, res) => {
    const { name, email, subject, message } = req.body;

    try {
        const newReport = new Report({
            name,
            email,
            subject,
            message
        });

        await newReport.save();  // Simpan laporan ke database

        // Setelah laporan disimpan, redirect ke halaman dashboard admin
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving report.');
    }
});

module.exports = router;
