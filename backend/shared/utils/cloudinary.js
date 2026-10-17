const cloudinary = require('cloudinary').v2;
const config = require('../config');

if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
}

/**
 * Generate signed upload signature for secure direct client uploads
 */
const getSignedUploadParams = (folder = 'infotech-portal') => {
  if (!config.cloudinary.apiSecret) {
    return {
      isMock: true,
      message: 'Cloudinary credentials not configured in environment',
    };
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    config.cloudinary.apiSecret
  );

  return {
    timestamp,
    signature,
    apiKey: config.cloudinary.apiKey,
    cloudName: config.cloudinary.cloudName,
    folder,
  };
};

/**
 * Server-side upload from base64 or file buffer
 */
const uploadImage = async (fileData, folder = 'infotech-portal') => {
  if (!config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
    // Return placeholder
    return {
      secure_url: fileData.startsWith('http') ? fileData : 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
      public_id: `mock-${Date.now()}`,
    };
  }

  return await cloudinary.uploader.upload(fileData, {
    folder,
    resource_type: 'image',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1200, crop: 'limit' }],
  });
};

module.exports = {
  getSignedUploadParams,
  uploadImage,
};
