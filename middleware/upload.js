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

//== Report Image Upload
const reportStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'trashBeta/profile', // folder name in Cloudinary
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'pdf', 'txt'],
      resource_type: 'auto', // handles both images and videos
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`, // unique ID
    };
  },
});


module.exports = {
  upload: multer({ storage: profileStorage }),
  reportUpload: multer({ storage: reportStorage })
};