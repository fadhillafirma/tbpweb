const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const db = require('../db');

router.get('/delete/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM events WHERE id = ?', [id], (err) => {
    if (err) throw err;
    res.redirect('/admin/events');
  });
});

router.get('/events', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;
  const search = (req.query.search || '').trim();
  const start = req.query.start || '';
  const end = req.query.end || '';
  const fakultas = (req.query.fakultas || '').trim();

  const whereParts = [];
  const params = [];

  if (search) {
    whereParts.push('(events.name LIKE ? OR events.fakultas LIKE ? OR events.location LIKE ? OR users.nama_organisasi LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (start && end) {
    whereParts.push('DATE(events.event_date) BETWEEN ? AND ?');
    params.push(start, end);
  }

  if (fakultas) {
    whereParts.push('events.fakultas LIKE ?');
    params.push(`%${fakultas}%`);
  }

  const whereClause = whereParts.length ? 'WHERE ' + whereParts.join(' AND ') : '';

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM events
    LEFT JOIN users ON events.user_id = users.id
    ${whereClause}
  `;

  db.query(countQuery, params, (err, countResult) => {
    if (err) throw err;

    const totalData = countResult[0].total;
    const totalPages = Math.ceil(totalData / limit);

 const dataQuery = `
  SELECT events.*, users.nama_organisasi AS organisasi
  FROM events
  LEFT JOIN users ON events.user_id = users.id
  ${whereClause}
  ORDER BY events.event_date DESC
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
        poster: event.poster_url || null,
        organisasi: event.organisasi || '-'
      }));

      res.render('kelolaeventadmin', {
        events,
        currentPage: page,
        totalPages,
        limit: req.query.limit ? limit : null,
        search,
        start,
        end,
        fakultas
      });
    });
  });
});

router.get('/events/pdf', (req, res) => {
  const search = (req.query.search || '').trim();
  const start = req.query.start || '';
  const end = req.query.end || '';
  const fakultas = (req.query.fakultas || '').trim();

  const whereParts = [];
  const params = [];

  if (search) {
    whereParts.push('(nama_organisasi LIKE ? OR fakultas LIKE ? OR email LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (start && end) {
    whereParts.push('DATE(events.event_date) BETWEEN ? AND ?');
    params.push(start, end);
  }

  if (fakultas) {
    whereParts.push('events.fakultas LIKE ?');
    params.push(`%${fakultas}%`);
  }

  const whereClause = whereParts.length ? 'WHERE ' + whereParts.join(' AND ') : '';

  const query = `
  SELECT events.*, users.nama_organisasi AS organisasi
  FROM events
  LEFT JOIN users ON events.user_id = users.id
  ${whereClause}
  ORDER BY events.event_date DESC
`;

  db.query(query, params, (err, results) => {
    if (err) throw err;

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="daftar_events.pdf"');
    doc.pipe(res);

    doc.fontSize(20).text('Daftar Events', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('No', 30, doc.y, { continued: true, width: 30 });
    doc.text('Tanggal', 60, doc.y, { continued: true, width: 80 });
    doc.text('Nama Event', 140, doc.y, { continued: true, width: 120 });
    doc.text('Organisasi', 260, doc.y, { continued: true, width: 80 });
    doc.text('Fakultas', 340, doc.y, { continued: true, width: 80 });
    doc.text('Lokasi', 420, doc.y, { width: 100 });
    doc.moveDown(0.5);

    doc.font('Helvetica');
    results.forEach((event, index) => {
      const tanggal = event.event_date ? event.event_date.toISOString().split('T')[0] : '-';
      doc.text(`${index + 1}`, 30, doc.y, { continued: true, width: 30 });
      doc.text(tanggal, 60, doc.y, { continued: true, width: 80 });
      doc.text(event.name, 140, doc.y, { continued: true, width: 120 });
      doc.text(event.nama_organisasi || '-', 260, doc.y, { continued: true, width: 80 });
      doc.text(event.fakultas || '-', 340, doc.y, { continued: true, width: 80 });
      doc.text(event.location || '-', 420, doc.y, { width: 100 });
      doc.text(event.organisasi || '-', 260, doc.y, { continued: true, width: 80 });
    });

    doc.end();
  });
});

module.exports = router;
