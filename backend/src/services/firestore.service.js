const { firestoreDb } = require('../config/firebaseAdmin');
const logger = require('../middleware/logger');

// Local in-memory store for guest sessions and testing
const localHistoryStore = new Map();

function shouldUseLocalStore(userId) {
  if (process.env.NODE_ENV === 'test') return true;
  if (!firestoreDb) return true;
  if (!userId || userId.startsWith('guest_') || userId.startsWith('test_')) return true;
  return false;
}

/**
 * Persist analysis result under user's Firestore collection
 */
async function saveSubmission(userId, submissionData) {
  const submissionId = submissionData.id || `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const record = {
    ...submissionData,
    id: submissionId,
    userId,
    updatedAt: new Date().toISOString()
  };

  // Cache in local in-memory store
  if (!localHistoryStore.has(userId)) {
    localHistoryStore.set(userId, []);
  }
  const userList = localHistoryStore.get(userId);
  userList.unshift(record);
  if (userList.length > 50) userList.pop();

  if (!shouldUseLocalStore(userId)) {
    try {
      await firestoreDb
        .collection('users')
        .doc(userId)
        .collection('submissions')
        .doc(submissionId)
        .set(record);

      logger.info('Submission persisted to Firestore', {
        userId,
        submissionId,
        documentType: submissionData.documentType
      });
    } catch (err) {
      logger.warn('Failed to persist to Firestore — cached locally', { error: err.message });
    }
  }

  return record;
}

/**
 * Retrieve user's submission history
 */
async function getUserSubmissions(userId) {
  if (!shouldUseLocalStore(userId)) {
    try {
      const snapshot = await firestoreDb
        .collection('users')
        .doc(userId)
        .collection('submissions')
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();

      if (!snapshot.empty) {
        return snapshot.docs.map(doc => doc.data());
      }
    } catch (err) {
      logger.warn('Firestore fetch failed, returning local cache', { error: err.message });
    }
  }

  return localHistoryStore.get(userId) || [];
}

/**
 * Retrieve single submission by ID
 */
async function getSubmissionById(userId, submissionId) {
  if (!shouldUseLocalStore(userId)) {
    try {
      const doc = await firestoreDb
        .collection('users')
        .doc(userId)
        .collection('submissions')
        .doc(submissionId)
        .get();

      if (doc.exists) {
        return doc.data();
      }
    } catch (err) {}
  }

  const userList = localHistoryStore.get(userId) || [];
  return userList.find(s => s.id === submissionId) || null;
}

module.exports = {
  saveSubmission,
  getUserSubmissions,
  getSubmissionById,
  localHistoryStore
};
