var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Import routing
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var connection = require('../db');  // Mengimpor koneksi database

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Set folder untuk file statis seperti gambar, CSS, dll.
app.use(express.static(path.join(__dirname, 'public')));

// Routing untuk halaman index dan users
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Routing untuk halaman events
app.get('/events', function(req, res, next) {
  // Merender file event.ejs yang ada di dalam folder views
  res.render('event');  
});

// Routing untuk halaman komentar
app.get('/comments', (req, res) => {
  // Mengambil komentar dari database
  connection.query('SELECT * FROM comments ORDER BY comment_datetime DESC', (err, results) => {
    if (err) {
      console.error('Error fetching comments: ', err);
      return res.status(500).send('Error fetching comments');
    }

    // Render halaman komentar dengan data dari database
    res.render('index', { comments: results });
  });
});

// Routing untuk menyimpan komentar ke database
app.post('/submit-comment', (req, res) => {
  const { comment_text, user_id } = req.body;

  // Pastikan komentar tidak kosong
  if (comment_text && comment_text.trim() !== "") {
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

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Menentukan port
var PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
