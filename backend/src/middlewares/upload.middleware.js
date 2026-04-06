/**
 * Upload Middleware
 * File upload handling with Cloudinary or local storage
 */
const { createUpload } = require('../configs/cloudinary');

const upload = createUpload();

// Single image upload
const uploadSingle = upload.single('image');

// Handle upload errors
const handleUploadError = (err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 5MB limit',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed',
    });
  }
  next();
};

module.exports = { uploadSingle, handleUploadError };
