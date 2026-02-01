// middleware/upload.js

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Cloudinary Storage setup

//== Profile Image Upload
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'trashBeta/profile', // folder name in Cloudinary
      allowed_formats: ['jpg', 'jpeg', 'png'],
      resource_type: 'image', // handles images
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`, // unique ID
    };
  },
});



module.exports = {
  upload: multer({ storage: profileStorage })
};