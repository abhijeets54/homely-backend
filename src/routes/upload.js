const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadImage } = require('../utils/cloudinary');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../temp');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'upload-' + uniqueSuffix + ext);
  }
});

// Helper function to safely delete a file
const safelyDeleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
};

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Increased to 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Only .jpeg, .jpg, .png, and .webp files are allowed'));
  }
});

// Route for uploading images to Cloudinary
router.post('/', upload.single('image'), async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }
    
    filePath = req.file.path;
    const folder = req.body.folder || 'misc';
    
    // Set a timeout for the Cloudinary upload
    const uploadPromise = uploadImage(filePath, folder);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Upload timeout')), 25000); // 25 second timeout
    });
    
    // Race the upload against the timeout
    const result = await Promise.race([uploadPromise, timeoutPromise]);
    
    // Delete temporary file
    safelyDeleteFile(filePath);
    filePath = null;
    
    res.status(200).json({
      message: 'Image uploaded successfully',
      secure_url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // Clean up temp file if it exists
    if (filePath) {
      safelyDeleteFile(filePath);
    }
    
    // Send appropriate error response
    if (error.message === 'Upload timeout') {
      return res.status(504).json({ 
        message: 'Upload timed out. The image might be too large or Cloudinary service is slow.',
        error: error.message
      });
    }
    
    res.status(500).json({ 
      message: 'Error uploading image', 
      error: error.message || 'Unknown error'
    });
  }
});

// Route for uploading images from URL to Cloudinary
router.post('/url', async (req, res) => {
  try {
    const { imageUrl, folder = 'misc' } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ message: 'No image URL provided' });
    }
    
    // Set a timeout for the Cloudinary upload
    const uploadPromise = uploadImage(imageUrl, folder);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Upload timeout')), 25000); // 25 second timeout
    });
    
    // Race the upload against the timeout
    const result = await Promise.race([uploadPromise, timeoutPromise]);
    
    res.status(200).json({
      message: 'Image uploaded successfully',
      secure_url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Error uploading image from URL:', error);
    
    // Send appropriate error response
    if (error.message === 'Upload timeout') {
      return res.status(504).json({ 
        message: 'Upload timed out. The image URL might be invalid or Cloudinary service is slow.',
        error: error.message
      });
    }
    
    res.status(500).json({ 
      message: 'Error uploading image', 
      error: error.message || 'Unknown error'
    });
  }
});

module.exports = router; 