import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../middleware/errorHandler.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only images are allowed.', 400), false);
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 10 // Maximum 10 files
  }
});

// Upload single image to Cloudinary
export const uploadSingleImage = async (file, folder = 'uploads') => {
  try {
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      {
        folder,
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' }
        ]
      }
    );
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new AppError('Failed to upload image', 500);
  }
};

// Upload multiple images to Cloudinary
export const uploadMultipleImages = async (files, folder = 'uploads') => {
  try {
    const uploadPromises = files.map(file => uploadSingleImage(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw new AppError('Failed to upload images', 500);
  }
};

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw new AppError('Failed to delete image', 500);
  }
};

// Delete multiple images from Cloudinary
export const deleteMultipleImages = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error('Error deleting multiple images:', error);
    throw new AppError('Failed to delete images', 500);
  }
};

// Generate image URL with transformations
export const generateImageUrl = (publicId, transformations = {}) => {
  try {
    const url = cloudinary.url(publicId, {
      ...transformations,
      secure: true
    });
    return url;
  } catch (error) {
    console.error('Error generating image URL:', error);
    throw new AppError('Failed to generate image URL', 500);
  }
};

// Upload avatar image
export const uploadAvatar = async (file, userId) => {
  try {
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      {
        folder: `avatars/${userId}`,
        resource_type: 'image',
        transformation: [
          { width: 200, height: 200, crop: 'fill', gravity: 'face' },
          { quality: 'auto' },
          { format: 'auto' }
        ]
      }
    );
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw new AppError('Failed to upload avatar', 500);
  }
};

// Upload auction images
export const uploadAuctionImages = async (files, auctionId) => {
  try {
    const uploadPromises = files.map((file, index) => 
      cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          folder: `auctions/${auctionId}`,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto' },
            { format: 'auto' }
          ],
          public_id: `image_${index + 1}`
        }
      )
    );
    
    const results = await Promise.all(uploadPromises);
    return results.map((result, index) => ({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      order: index + 1,
      isPrimary: index === 0
    }));
  } catch (error) {
    console.error('Error uploading auction images:', error);
    throw new AppError('Failed to upload auction images', 500);
  }
};

// Upload product images
export const uploadProductImages = async (files, productId) => {
  try {
    const uploadPromises = files.map((file, index) => 
      cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          folder: `products/${productId}`,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto' },
            { format: 'auto' }
          ],
          public_id: `image_${index + 1}`
        }
      )
    );
    
    const results = await Promise.all(uploadPromises);
    return results.map((result, index) => ({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      order: index + 1,
      isPrimary: index === 0
    }));
  } catch (error) {
    console.error('Error uploading product images:', error);
    throw new AppError('Failed to upload product images', 500);
  }
};

// Upload category image
export const uploadCategoryImage = async (file, categoryId) => {
  try {
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      {
        folder: `categories/${categoryId}`,
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill' },
          { quality: 'auto' },
          { format: 'auto' }
        ]
      }
    );
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    console.error('Error uploading category image:', error);
    throw new AppError('Failed to upload category image', 500);
  }
};

// Get image info
export const getImageInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      createdAt: result.created_at
    };
  } catch (error) {
    console.error('Error getting image info:', error);
    throw new AppError('Failed to get image info', 500);
  }
};

// Create image gallery
export const createImageGallery = (images, options = {}) => {
  const {
    thumbnailSize = 150,
    mediumSize = 400,
    largeSize = 800,
    quality = 'auto'
  } = options;
  
  return images.map(image => ({
    original: image.url,
    thumbnail: generateImageUrl(image.publicId, {
      width: thumbnailSize,
      height: thumbnailSize,
      crop: 'fill',
      quality
    }),
    medium: generateImageUrl(image.publicId, {
      width: mediumSize,
      height: mediumSize,
      crop: 'limit',
      quality
    }),
    large: generateImageUrl(image.publicId, {
      width: largeSize,
      height: largeSize,
      crop: 'limit',
      quality
    }),
    publicId: image.publicId,
    order: image.order,
    isPrimary: image.isPrimary
  }));
};

// Middleware for single file upload
export const uploadSingle = (fieldName = 'image') => {
  return upload.single(fieldName);
};

// Middleware for multiple files upload
export const uploadMultiple = (fieldName = 'images', maxCount = 10) => {
  return upload.array(fieldName, maxCount);
};

// Middleware for mixed files upload
export const uploadFields = (fields) => {
  return upload.fields(fields);
};

export default {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  generateImageUrl,
  uploadAvatar,
  uploadAuctionImages,
  uploadProductImages,
  uploadCategoryImage,
  getImageInfo,
  createImageGallery,
  uploadSingle,
  uploadMultiple,
  uploadFields
};
