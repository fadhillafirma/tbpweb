const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/delete/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM events WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.redirect('/');
  });
});

router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page  = parseInt(req.query.page)  || 1;
  const offset = (page - 1) * limit;
  const search = (req.query.search || '').trim();
  const date   = req.query.date || '';

  const whereParts = [];
  const params     = [];

  if (search) {
    whereParts.push('(name LIKE ? OR fakultas LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (date) {
    whereParts.push('DATE(event_date) = ?');
    params.push(date);
  }
  const whereClause = whereParts.length ? 'WHERE ' + whereParts.join(' AND ') : '';

  const countQuery = `SELECT COUNT(*) AS total FROM events ${whereClause}`;
  db.query(countQuery, params, (err, countResult) => {
    if (err) throw err;
    const totalPages = Math.ceil(countResult[0].total / limit);

    const dataQuery = `
      SELECT * FROM events
      ${whereClause}
      ORDER BY id ASC
      LIMIT ? OFFSET ?
    `;
    db.query(dataQuery, [...params, limit, offset], (err, results) => {
      if (err) throw err;

      const events = results.map((event, i) => ({
        id: event.id,
        no: offset + i + 1,
        tanggal: event.event_date ? event.event_date.toISOString().split('T')[0] : '-',
        nama: event.name,
        fakultas: event.fakultas || '-',
        lokasi: event.location || '-',
        deskripsi: event.description || '-',
        poster: event.poster_url || null
      }));

      res.render('kelolaeventogz', {
        events,
        currentPage: page,
        totalPages,
        limit: req.query.limit ? limit : null,
         search: req.query.search || '',
         date: req.query.date || ''
      });
    });
  });
});

module.exports = router;
