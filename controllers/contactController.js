const Contact = require('../models/Contact');  // Jika Anda ingin menyimpan kontak ke DB

exports.submitContactForm = (req, res) => {
  const { fullName, email, subject, message } = req.body;

  // Proses data form yang dikirim
  // Contoh simpan ke database atau kirim email
  const newContact = new Contact({
    fullName,
    email,
    subject,
    message,
  });

  newContact.save((err, savedContact) => {
    if (err) {
      console.error("Gagal mengirim pesan:", err);
      return res.status(500).send("Terjadi kesalahan saat mengirim pesan.");
    }
    res.redirect('/thank-you');  // Redirect ke halaman terima kasih setelah berhasil
  });
};
