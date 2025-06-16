const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Upload an image to Cloudinary
 * @param {string} imagePath - The path to the image file or base64 image data
 * @param {string} folder - The folder in Cloudinary to store the image
 * @returns {Promise<Object>} - The Cloudinary upload response
 */
const uploadImage = async (imagePath, folder = 'homely') => {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: `homely/${folder}`,
      use_filename: true,
      unique_filename: true,
      overwrite: true,
    });
    return result;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<Object>} - The Cloudinary deletion response
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

/**
 * Extract public ID from a Cloudinary URL
 * @param {string} url - The Cloudinary URL
 * @returns {string|null} - The public ID or null if not a Cloudinary URL
 */
const extractPublicId = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  
  // Extract the public ID from the URL
  // Example URL: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/homely/seller/image-name.jpg
  const regex = /\/v\d+\/(.+)$/;
  const match = url.match(regex);
  
  return match ? match[1] : null;
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  extractPublicId
}; 