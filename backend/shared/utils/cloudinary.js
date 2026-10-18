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

const dns = require('dns');
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Not supported in older node
}

/**
 * Server-side direct buffer upload (from Multer memoryStorage)
 * Streams buffer to Cloudinary. If Cloudinary credentials are mock/rejected,
 * gracefully saves as a high-fidelity data URI so the profile image is always preserved.
 */
const uploadBuffer = (buffer, mimetype = 'image/jpeg', folder = 'infotech-portal/profiles') => {
  return new Promise((resolve) => {
    const isMockOrMissing =
      !config.cloudinary.apiKey ||
      !config.cloudinary.apiSecret ||
      !config.cloudinary.cloudName ||
      config.cloudinary.cloudName.toLowerCase() === 'root';

    if (isMockOrMissing) {
      console.warn(`[Cloudinary] Cloudinary cloudName="${config.cloudinary.cloudName}" is a placeholder. Storing avatar as direct Data URI.`);
      return resolve({
        secure_url: `data:${mimetype};base64,${buffer.toString('base64')}`,
        public_id: `data-uri-${Date.now()}`,
        isDataUri: true,
      });
    }

    let resolved = false;

    // Safety timeout: if Cloudinary takes more than 4 seconds, fallback immediately
    const timeoutTimer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.warn('[Cloudinary] Upload timed out after 4s; falling back to direct Data URI');
        resolve({
          secure_url: `data:${mimetype};base64,${buffer.toString('base64')}`,
          public_id: `timeout-data-uri-${Date.now()}`,
          isFallback: true,
        });
      }
    }, 4000);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [
          { width: 500, height: 500, crop: 'fill', gravity: 'face' },
        ],
      },
      (error, result) => {
        clearTimeout(timeoutTimer);
        if (resolved) return;
        resolved = true;

        if (error) {
          console.error('[Cloudinary] Upload stream error:', error?.message || error);
          // Graceful fallback so student profile updates never crash
          return resolve({
            secure_url: `data:${mimetype};base64,${buffer.toString('base64')}`,
            public_id: `fallback-data-uri-${Date.now()}`,
            isFallback: true,
            error: error?.message,
          });
        }
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

module.exports = {
  getSignedUploadParams,
  uploadImage,
  uploadBuffer,
};
