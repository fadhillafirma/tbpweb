const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    name: {  // Nama pengirim laporan
        type: String,
        required: true
    },
    email: {  // Alamat email pengirim
        type: String,
        required: true
    },
    subject: {  // Subjek laporan
        type: String,
        required: true
    },
    message: {  // Isi pesan laporan
        type: String,
        required: true
    },
    status: {  // Status laporan, misalnya 'pending' (belum ditangani)
        type: String,
        default: 'pending'
    },
    createdAt: {  // Tanggal pembuatan laporan
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Report', reportSchema);
