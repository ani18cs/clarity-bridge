const { Storage } = require('@google-cloud/storage');
const { config } = require('../config/env');
const logger = require('../middleware/logger');

let storageClient = null;
let bucket = null;

try {
  storageClient = new Storage({ projectId: config.gcpProjectId });
  if (config.gcsBucketName) {
    bucket = storageClient.bucket(config.gcsBucketName);
  }
} catch (err) {
  logger.warn('Google Cloud Storage client in local fallback mode', { error: err.message });
}

/**
 * Upload file buffer to Google Cloud Storage
 */
async function uploadFile({ buffer, destination, mimeType = 'application/octet-stream' }) {
  if (process.env.NODE_ENV === 'test' || !bucket || !buffer) {
    // In test mode, local development, or when bucket is unconfigured, return a mock storage reference
    return {
      storagePath: `local://${destination}`,
      publicUrl: `/api/files/${destination}`,
      downloadUrl: null
    };
  }

  try {
    const file = bucket.file(destination);
    await file.save(buffer, {
      metadata: { contentType: mimeType },
      resumable: false
    });

    // Generate signed download URL (valid for 24 hours)
    let signedUrl = null;
    try {
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 24 * 60 * 60 * 1000
      });
      signedUrl = url;
    } catch (signErr) {}

    return {
      storagePath: `gs://${config.gcsBucketName}/${destination}`,
      publicUrl: `https://storage.googleapis.com/${config.gcsBucketName}/${destination}`,
      downloadUrl: signedUrl
    };
  } catch (err) {
    logger.warn('GCS upload error — using local fallback', { error: err.message });
    return {
      storagePath: `local://${destination}`,
      publicUrl: null,
      downloadUrl: null
    };
  }
}

module.exports = {
  uploadFile
};
