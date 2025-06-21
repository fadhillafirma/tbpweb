const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db'); 

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/event/new', (req, res) => {
  res.render('newevent'); 
});

router.post('/event/save', upload.single('poster'), (req, res) => {
  const { name, event_date, location, fakultas, description } = req.body;
  const poster_url = req.file ? `/uploads/${req.file.filename}` : null;

  const sql = 'INSERT INTO events (name, event_date, location, fakultas, description, poster_url) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [name, event_date, location, fakultas, description, poster_url];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Gagal menyimpan event:', err);
      return res.status(500).send('Gagal menyimpan data.');
    }
    res.redirect('/');
  });
});

module.exports = router;
