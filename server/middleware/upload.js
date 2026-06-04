const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Image storage
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'chatapp/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    resource_type: 'image'
  }
});

// File storage
const fileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'chatapp/files',
    allowed_formats: ['pdf', 'doc', 'docx', 'txt', 'zip'],
    resource_type: 'raw'
  }
});

const uploadImage = multer({ storage: imageStorage });
const uploadFile = multer({ storage: fileStorage });

module.exports = { uploadImage, uploadFile };