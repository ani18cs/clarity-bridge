const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env if present
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT || '8080', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  gcpProjectId: process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'clarity-bridge-project',
  gcsBucketName: process.env.GCS_BUCKET_NAME || 'clarity-bridge-uploads',
  gcpLocation: process.env.GCP_LOCATION || 'us-central1',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  customSearchApiKey: process.env.CUSTOM_SEARCH_API_KEY || '',
  customSearchEngineId: process.env.CUSTOM_SEARCH_ENGINE_ID || '',
  isProduction: (process.env.NODE_ENV === 'production'),
};

/**
 * Attempt to load missing secrets from Secret Manager if running in GCP environment
 */
async function loadSecretsFromSecretManager() {
  if (config.geminiApiKey && config.customSearchApiKey) {
    return; // Already loaded from env
  }

  try {
    const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
    const client = new SecretManagerServiceClient();

    if (!config.geminiApiKey) {
      try {
        const name = `projects/${config.gcpProjectId}/secrets/GEMINI_API_KEY/versions/latest`;
        const [version] = await client.accessSecretVersion({ name });
        config.geminiApiKey = version.payload.data.toString('utf8');
      } catch (err) {
        // Fallback or ignore if not found
      }
    }

    if (!config.customSearchApiKey) {
      try {
        const name = `projects/${config.gcpProjectId}/secrets/CUSTOM_SEARCH_API_KEY/versions/latest`;
        const [version] = await client.accessSecretVersion({ name });
        config.customSearchApiKey = version.payload.data.toString('utf8');
      } catch (err) {
        // Fallback or ignore
      }
    }
  } catch (err) {
    // Secret Manager client unavailable, using env vars
  }
}

module.exports = {
  config,
  loadSecretsFromSecretManager
};
