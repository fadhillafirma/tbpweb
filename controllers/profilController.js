const mysql = require('mysql2');
const path = require('path');
const multer = require('multer');

// Koneksi ke database MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',       // Sesuaikan dengan username MySQL Anda
  password: '',       // Sesuaikan dengan password MySQL Anda
  database: 'uvent_db' // Nama database yang Anda gunakan
});

// Mengatur penyimpanan file menggunakan multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Menyimpan gambar di folder 'uploads'
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Memberikan nama file unik dengan timestamp
  },
});

const upload = multer({ storage: storage }).single('avatar');

exports.getProfile = (req, res) => {
  const userId = req.session.userId;  // Mengambil userId dari session
  if (!userId) {
    return res.redirect('/login');  // Jika userId tidak ada, redirect ke login
  }

  // Ambil data dari tabel 'users' berdasarkan userId
  const query = 'SELECT * FROM users WHERE id = ?'; 
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error retrieving user profile:', err);
      return res.status(500).send('Error retrieving profile');
    }
    
    if (results.length > 0) {
      const user = results[0];  // Ambil data pengguna pertama

      // Mengecek apakah ada data yang belum lengkap
      const missingData = !user.first_name || !user.last_name || !user.email || !user.phone || !user.country || !user.city;

      // Debug log untuk memeriksa apakah missingData dikirim
      console.log("missingData: ", missingData);

      // Kirim data profil dan status missingData ke tampilan
      res.render('profil', { user: user, missingData: missingData });  // Pastikan missingData dikirim
    } else {
      res.status(404).send('User not found');
    }
  });
};

// Fungsi untuk memperbarui profil pengguna
exports.saveProfile = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Error uploading avatar:', err);
      return res.status(500).send('Error uploading avatar');
    }

    const { firstName, lastName, email, phone, dob, country, city } = req.body;
    const avatarPath = req.file ? '/uploads/' + req.file.filename : null;  // Path gambar yang di-upload

    const userId = req.session.userId || 1; // Gantilah dengan ID yang sesuai

    const role = "organizer"; // Role tidak boleh diubah, selalu "organizer"

    // Log data yang akan dikirim ke query
    console.log('Data yang dikirim untuk update profil:', {
      firstName, lastName, email, phone, dob, role, country, city, avatarPath, userId
    });

    const query = `UPDATE profiles 
                   SET first_name = ?, last_name = ?, email = ?, phone = ?, dob = ?, role = ?, country = ?, city = ?, avatar_url = ?, updated_at = NOW()
                   WHERE id = ?`;

    db.query(query, [firstName, lastName, email, phone, dob, role, country, city, avatarPath, userId], (err, results) => {
      if (err) {
        console.error('Error updating profile:', err);
        return res.status(500).json({ success: false, message: 'Failed to update profile' });
      }

      console.log('Query berhasil dijalankan, hasil:', results);

      // Setelah data diperbarui, ambil data terbaru dari database untuk dikirim kembali ke tampilan profil
      const queryGetProfile = 'SELECT * FROM profiles WHERE id = ?';
      db.query(queryGetProfile, [userId], (err, results) => {
        if (err) {
          console.error('Error retrieving updated profile:', err);
          return res.status(500).send('Error retrieving updated profile');
        }

        const updatedUser = results[0];
        res.render('profil', { user: updatedUser, missingData: false }); // Tidak ada data yang hilang
      });
    });
  });
};
