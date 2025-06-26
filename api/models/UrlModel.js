const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    longUrl: { type: String, required: true },
    shortUrl: { type: String, required: true, unique: true },
    customUrl: { type: String, unique: true, sparse: true },
    fullShortUrl: { type: String }, // Add this field
    qrCode: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    clicks: [{
        timestamp: { type: Date, default: Date.now },
        referrer: String,
        userAgent: String,
        ip: String,
        country: String
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('URL', urlSchema);