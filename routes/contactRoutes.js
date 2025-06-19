const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Rute untuk menampilkan halaman kontak
router.get('/', (req, res) => {
  res.render('contact');
});

// Rute untuk mengirim data formulir kontak
router.post('/submit', contactController.submitContactForm);

module.exports = router;
