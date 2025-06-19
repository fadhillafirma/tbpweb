const express = require('express');
const path = require('path');
const app = express();

// Menyediakan file statis dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// Menyusun route untuk halaman utama
app.get('/', (req, res) => {
  res.render('homepage'); // Misalnya merender file homepage.ejs
});

// Menentukan port
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
