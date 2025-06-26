const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

const generateShortUrl = () => {
  return uuidv4().split('-')[0];
};

const generateQRCode = async (url) => {
  try {
    return await QRCode.toDataURL(url);
  } catch (error) {
    console.error('QR Code generation error:', error);
    return null;
  }
};

module.exports = { generateShortUrl, generateQRCode };