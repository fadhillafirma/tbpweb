const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profilController');

// Rute untuk menampilkan halaman profil
router.get('/profil', profileController.getProfile);

// Rute untuk mengupdate profil
router.post('/profil', profileController.saveProfile);  // Pastikan rute ini ada

module.exports = router;