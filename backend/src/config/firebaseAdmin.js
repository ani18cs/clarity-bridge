const admin = require('firebase-admin');
const { config } = require('./env');

let firestoreDb = null;
let authAdmin = null;

try {
  if (!admin.apps.length) {
    if (process.env.FIREBASE_CONFIG_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG_JSON);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: config.gcpProjectId
      });
    } else {
      // Initialize with Application Default Credentials or Project ID
      admin.initializeApp({
        projectId: config.gcpProjectId
      });
    }
  }

  firestoreDb = admin.firestore();
  // Set Firestore settings if needed
  try {
    firestoreDb.settings({ ignoreUndefinedProperties: true });
  } catch (e) {}

  authAdmin = admin.auth();
} catch (err) {
  // Graceful fallback for mock/local test environments without active Firebase credentials
  console.warn('[FirebaseAdmin] Initialized in local/fallback mode:', err.message);
}

module.exports = {
  admin,
  firestoreDb,
  authAdmin
};
