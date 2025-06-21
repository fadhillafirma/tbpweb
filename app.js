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
const participantRoutes = require('./routes/pendaftaran'); // *Import participantRoutes dulu*
const reportRoutes = require('./routes/report'); // Import report routes
console.log('Report routes loaded'); // Tambahkan log untuk memverifikasi bahwa rute sudah dimuat

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
app.use(logger('dev'));  // Log setiap request ke server
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routing untuk halaman utama dan users
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/profil', profilRoutes);

// Pindahkan participantRoutes ke sini agar bisa digunakan
app.use('/', participantRoutes);  // Menggunakan prefix '/'

// Routing untuk halaman homepage
app.get('/', (req, res) => {
  res.render('homepage');  // Pastikan 'homepage' adalah nama file EJS yang kamu buat
});

// Routing untuk halaman events
app.get('/events', function(req, res, next) {
  res.render('event');
});

// Menangani rute buktipendaftar
app.get('/buktipendaftar', (req, res) => {
  const { nama, email, whatsapp, event } = req.query;

  // Pastikan Anda merender buktipendaftar.ejs dengan data yang diperlukan
  res.render('buktipendaftar', {
    nama: nama,
    email: email,
    whatsapp: whatsapp,
    event: event
  });
});

// Menambahkan rute untuk laporan
app.use('/report', reportRoutes); // Menambahkan rute laporan

// Handle 404 errors
app.use(function(req, res, next) {
  next(createError(404));  // Jika rute tidak ditemukan
});

// Error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

// Dashboard Route (Setelah login berhasil)
app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');  // Jika tidak ada sesi, arahkan kembali ke login
  }

  res.render('dashboard');  // Gantilah dengan tampilan dashboard yang sesuai
});

// Menangani port yang sudah digunakan dan error handling untuk EADDRINUSE
const port = process.env.PORT || 3003; // Ganti 3001 menjadi 3003

app.listen(port, (err) => {
  if (err) {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} sudah digunakan. Silakan gunakan port yang berbeda.`);
    } else {
      console.error('Terjadi error yang tidak terduga:', err);
    }
  } else {
    console.log(`Server berjalan di http://localhost:${port}`);
  }
});

module.exports = app;
