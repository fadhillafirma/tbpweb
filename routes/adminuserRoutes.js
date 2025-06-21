const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/users/delete/:id', (req, res) => {
  const userId = req.params.id;
  const query = 'DELETE FROM users WHERE id = ?';

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error('Gagal hapus user:', err);
      return res.status(500).send('Gagal hapus user');
    }
    res.redirect('/admin/users');
  });
});

router.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  const queryUser = 'SELECT * FROM users WHERE id = ?';
  const queryEventCount = 'SELECT COUNT(*) AS total_event FROM events WHERE user_id = ?';

  db.query(queryUser, [userId], (err, userResults) => {
    if (err) {
      console.error('Gagal ambil data user:', err);
      return res.status(500).send('Gagal ambil data user');
    }

    if (userResults.length === 0) {
      return res.status(404).send('User tidak ditemukan');
    }

    const user = userResults[0];

    db.query(queryEventCount, [userId], (err, eventResults) => {
      if (err) {
        console.error('Gagal menghitung event:', err);
        return res.status(500).send('Gagal hitung total event');
      }

      user.total_event = eventResults[0].total_event || 0;

      res.render('detailuser', { user });
    });
  });
});

router.get('/users', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;
  const search = (req.query.search || '').trim();

  const whereParts = [];
  const params = [];

 if (search) {
  whereParts.push('(nama_organisasi LIKE ? OR fakultas LIKE ? OR email LIKE ?)');
  params.push(`%${search}%`, `%${search}%`, `%${search}%`);
}

  const whereClause = whereParts.length ? 'WHERE ' + whereParts.join(' AND ') : '';

  const countQuery = `SELECT COUNT(*) AS total FROM users ${whereClause}`;
  db.query(countQuery, params, (err, countResult) => {
    if (err) throw err;
    const totalData = countResult[0].total;
    const totalPages = Math.ceil(totalData / limit);

    const dataQuery = `
      SELECT * FROM users
      ${whereClause}
      ORDER BY id ASC
      LIMIT ? OFFSET ?
    `;

    db.query(dataQuery, [...params, limit, offset], (err, results) => {
      if (err) throw err;

      const users = results.map((user, i) => {
        let fotoUrl = '/assets/images/default-profile.png';
        if (user.foto_profil && user.foto_profil.trim() !== '') {
          fotoUrl = user.foto_profil.startsWith('/')
            ? user.foto_profil
            : '/' + user.foto_profil;
        }

        return {
          no: offset + i + 1,
          id: user.id,
          foto: fotoUrl,
          nama: user.nama_organisasi || '-',
          fakultas: user.fakultas || '-',
          email: user.email || '-'
        };
      });

      res.render('kelolauser', {
        users,
        currentPage: page,
        totalPages,
        limit: req.query.limit ? limit : null,
        search
      });
    });
  });
});

module.exports = router;
