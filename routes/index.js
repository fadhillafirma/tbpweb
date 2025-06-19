var express = require('express');
var router = express.Router();
const connection = require('../database');  // Mengimpor koneksi database

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET event page. */
router.get('/event', function(req, res, next) {
  res.render('event', { title: 'Event' });
});

// Routing untuk menyimpan komentar ke database
router.post('/submit-comment', (req, res) => {
  const { comment_text, user_id } = req.body;  // Mengambil data dari request body

  // Pastikan komentar tidak kosong
  if (comment_text && comment_text.trim() !== "") {
    // Query untuk menyimpan komentar ke database
    const query = 'INSERT INTO comments (user_id, comment_text) VALUES (?, ?)';

    connection.query(query, [user_id, comment_text], (err, result) => {
      if (err) {
        console.error('Error inserting comment: ', err);
        return res.status(500).send('Error saving comment');
      }
      res.status(200).json({ message: 'Comment saved successfully' });
    });
  } else {
    res.status(400).json({ message: 'Comment cannot be empty' });
  }
});

// Routing untuk mengambil semua komentar dari database
router.get('/comments', (req, res) => {
  const query = 'SELECT * FROM comments ORDER BY comment_datetime DESC';  // Mengambil semua komentar

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching comments: ', err);
      return res.status(500).send('Error fetching comments');
    }
    res.status(200).json(results);  // Mengirim hasil komentar ke frontend dalam format JSON
  });
});

// **Menambahkan route untuk pendaftaran**
// Route untuk menampilkan halaman formulir pendaftaran
router.get('/formulirdaftar', (req, res) => {
  res.render('formulirdaftar'); // Render halaman formulirdaftar.ejs
});

// Route untuk menangani pendaftaran dan menyimpannya ke database
router.post('/submit-transaction', (req, res) => {
  const { fullName, identityType, identityNumber, email, whatsapp } = req.body;

  // Generate nomor pendaftaran (misalnya menggunakan timestamp)
  const registrationNumber = 'REG-' + new Date().getTime();

  // Ambil tanggal saat ini
  const issueDate = new Date();

  // Query untuk menyimpan data pendaftaran ke tabel pendaftaran_acara
  const query = `INSERT INTO pendaftaran_acara (full_name, identity_type, identity_number, email, whatsapp, registration_number, issue_date) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

  connection.query(query, [fullName, identityType, identityNumber, email, whatsapp, registrationNumber, issueDate], (err, result) => {
    if (err) {
      console.error('Error inserting data: ', err);
      return res.status(500).send('Error saving registration');
    }

    // Kirim response sukses
    res.status(200).json({ message: 'Pendaftaran berhasil', registrationNumber, issueDate });
  });
});

module.exports = router;
