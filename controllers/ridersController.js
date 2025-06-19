const Rider = require('../models/Rider'); // asumsikan Anda sudah membuat model Rider

exports.getRiders = (req, res) => {
  Rider.find({}, (err, riders) => {
    if (err) return res.status(500).send("Gagal mengambil data riders");
    res.render('riders', { riders });
  });
};

exports.addRider = (req, res) => {
  const { name, age, event } = req.body;
  const newRider = new Rider({ name, age, event });

  newRider.save((err, savedRider) => {
    if (err) return res.status(500).send("Gagal menambahkan rider");
    res.redirect('/riders');
  });
};
