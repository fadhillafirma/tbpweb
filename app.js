var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');  // Import connect-flash

const db = require('./db'); // Menggunakan koneksi database tunggal
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var profilRoutes = require('./routes/profilRoutes'); // Rute untuk profil

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Setup express-session terlebih dahulu sebelum connect-flash
app.use(session({
  secret: 'your-secret-key',  // Kunci rahasia sesi (gunakan yang lebih kuat)
  resave: false,  // Jangan simpan sesi jika tidak ada perubahan
  saveUninitialized: true,  // Simpan sesi meskipun belum ada data
  cookie: { secure: false }  // Jika menggunakan HTTPS, set true
}));

app.use(flash());  // Menggunakan connect-flash

// Middleware untuk menyimpan pesan flash ke res.locals
app.use((req, res, next) => {
  res.locals.messages = req.flash();  // Menyimpan pesan flash di res.locals.messages
  next();
});

// Middleware untuk memeriksa sesi user (userId) dan mendapatkan data user
app.use((req, res, next) => {
  if (req.session.userId) {
    db.query('SELECT * FROM users WHERE id = ?', [req.session.userId], (err, results) => {
      if (err) {
        return next(err);
      }

      const user = results[0]; // Ambil data pengguna pertama

      // Mengecek apakah ada data yang belum lengkap (missingData)
      const missingData = !user.first_name || !user.last_name || !user.email || !user.phone || !user.country || !user.city;

      // Menambahkan missingData ke res.locals
      res.locals.missingData = missingData;  // Menambahkan missingData ke res.locals
      res.locals.user = user;  // Menambahkan user ke res.locals
      next();
    });
  } else {
    next();
  }
});

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Set folder untuk file statis seperti gambar, CSS, dll.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routing untuk halaman utama dan users
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/profil', profilRoutes);

// Routing untuk halaman homepage
app.get('/', (req, res) => {
  res.render('homepage');  // Pastikan 'homepage' adalah nama file EJS yang kamu buat
});

// Routing untuk halaman events
app.get('/events', function(req, res, next) {
  res.render('event');
});

// Routing untuk halaman komentar
app.get('/comments', (req, res) => {
  db.query('SELECT * FROM comments ORDER BY comment_datetime DESC', (err, results) => {
    if (err) {
      console.error('Error fetching comments: ', err);
      return res.status(500).send('Error fetching comments');
    }
    res.render('index', { comments: results });
  });
});

// Routing untuk menyimpan komentar ke database
app.post('/submit-comment', (req, res) => {
  const { comment_text, user_id } = req.body;

  if (comment_text && comment_text.trim() !== "") {
    const query = 'INSERT INTO comments (user_id, comment_text) VALUES (?, ?)';
    db.query(query, [user_id, comment_text], (err, result) => {
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

// Dashboard Route (Setelah login berhasil)
app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');  // Jika tidak ada sesi, arahkan kembali ke login
  }

  res.render('dashboard');  // Gantilah dengan tampilan dashboard yang sesuai
});

// Handle 404 errors
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

// Menentukan port
var PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(Server is running on port ${PORT});
});

module.exports = app;