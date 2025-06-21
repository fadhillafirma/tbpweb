const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.get('/event/edit/:id', (req, res) => {
  const eventId = req.params.id;
  db.query('SELECT * FROM events WHERE id = ?', [eventId], (err, results) => {
    if (err) return res.status(500).send('Database error');
    if (!results.length) return res.status(404).send('Event tidak ditemukan');

    const event = results[0];
    res.render('editevent', { event });
  });
});

router.post('/event/update/:id', upload.single('poster'), (req, res) => {
  const id = req.params.id;
  const { name, event_date, location, fakultas, description } = req.body;
  let updateQuery, params;

  if (req.file) {
    const poster_url = `/uploads/${req.file.filename}`;
    updateQuery = `
      UPDATE events
      SET name = ?, event_date = ?, location = ?, fakultas = ?, description = ?, poster_url = ?
      WHERE id = ?
    `;
    params = [name, event_date, location, fakultas, description, poster_url, id];
  } else {
    updateQuery = `
      UPDATE events
      SET name = ?, event_date = ?, location = ?, fakultas = ?, description = ?
      WHERE id = ?
    `;
    params = [name, event_date, location, fakultas, description, id];
  }

  db.query(updateQuery, params, (err, result) => {
    if (err) return res.status(500).send('Gagal update');
    res.redirect('/');
  });
});

module.exports = router;
