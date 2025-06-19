const express = require('express');
const path = require('path');
const mysql = require('mysql2');  // Menggunakan mysql (bukan mysql2)
const bodyParser = require('body-parser');
const app = express();

// Menyediakan file statis dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// Menentukan folder views untuk file EJS
app.set('views', path.join(__dirname, 'views'));

// Menentukan EJS sebagai view engine
app.set('view engine', 'ejs');

// Middleware untuk parsing request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Konfigurasi koneksi ke database MySQL
const db = mysql.createConnection({
  host: 'localhost',       // Host database, biasanya 'localhost'
  user: 'root',            // Username MySQL (ganti sesuai dengan akun MySQL Anda)
  password: '',            // Password MySQL (ganti jika ada password)
  database: 'uvent_db',    // Nama database yang digunakan
  port: 3306               // Port MySQL default (3306)
});

// Menyambungkan ke database MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Route untuk halaman utama
app.get('/', (req, res) => {
  // Mengambil data dari tabel pendaftaran_acara
  db.query('SELECT * FROM pendaftaran_acara', (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).send('Error fetching data');
    }

    // Menyajikan data ke halaman homepage.ejs
    res.render('homepage', { pendaftaran: results });
  });
});

// Menentukan port untuk server Express
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
