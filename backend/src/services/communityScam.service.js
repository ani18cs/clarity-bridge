const { firestoreDb } = require('../config/firebaseAdmin');
const { scrubPatternObject, scrubPII } = require('../utils/piiScrubber');
const logger = require('../middleware/logger');

// Local in-memory scam pattern database for offline development & tests
const localScamPatternStore = [
  {
    id: 'seed_scam_1',
    documentType: 'suspicious_solicitation',
    issuingAuthorityClaimed: 'Federal Tax / Police Clearance Unit',
    threatPhrases: ['arrest warrant within 2 hours', 'police will arrive', 'assets frozen'],
    paymentMethodsRequested: ['Apple Gift Cards', 'Target Gift Cards', 'Bitcoin Wallet'],
    reportedAt: new Date().toISOString()
  },
  {
    id: 'seed_scam_2',
    documentType: 'suspicious_solicitation',
    issuingAuthorityClaimed: 'Instant Loan Clearance / Recovery Bureau',
    threatPhrases: ['contact all your phone contacts', 'immediate legal FIR', 'share OTP to cancel'],
    paymentMethodsRequested: ['UPI QR Code', 'Crypto Transfer'],
    reportedAt: new Date().toISOString()
  },
  {
    id: 'seed_scam_3',
    documentType: 'suspicious_solicitation',
    issuingAuthorityClaimed: 'Electricity / Utility Department Disconnection Cell',
    threatPhrases: ['power supply will be disconnected tonight', 'call officer immediately'],
    paymentMethodsRequested: ['Unauthorized APK Link', 'Direct Transfer'],
    reportedAt: new Date().toISOString()
  }
];

/**
 * Save an anonymized, PII-scrubbed pattern to the shared Community Scam Pool
 * @param {Object} patternData - Pattern data submitted by a user
 * @returns {Promise<Object>} - Stored record
 */
async function recordCommunityScamPattern(patternData) {
  const anonymized = scrubPatternObject(patternData);
  const patternId = `pat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const record = {
    id: patternId,
    ...anonymized
  };

  // Add to local store
  localScamPatternStore.push(record);
  if (localScamPatternStore.length > 500) localScamPatternStore.shift();

  // If Firestore is available and not in test mode, save to shared collection
  if (firestoreDb && process.env.NODE_ENV !== 'test') {
    try {
      await firestoreDb.collection('scamPatterns').doc(patternId).set(record);
      logger.info('Recorded anonymized scam pattern in Firestore', {
        patternId,
        documentType: record.documentType,
        authority: record.issuingAuthorityClaimed
      });
    } catch (err) {
      logger.warn('Failed to persist scam pattern to Firestore — saved to memory', { error: err.message });
    }
  }

  return record;
}

/**
 * Check a document against the shared community scam pattern pool
 * @param {Object} params - Document data
 * @returns {Promise<Object>} - Match count and matched signals
 */
async function matchAgainstCommunityScams({ issuingAuthorityClaimed = '', rawText = '', paymentMethods = [] }) {
  const normalizedAuthority = (issuingAuthorityClaimed || '').toLowerCase();
  const normalizedText = (rawText || '').toLowerCase();
  const matchedPatterns = [];

  let pool = [...localScamPatternStore];

  // If Firestore is active, fetch recent patterns with 1s fast timeout safeguard
  if (firestoreDb && process.env.NODE_ENV !== 'test') {
    try {
      const fetchPromise = firestoreDb.collection('scamPatterns').limit(50).get();
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 1000));
      const snapshot = await Promise.race([fetchPromise, timeoutPromise]);
      if (snapshot && !snapshot.empty) {
        const remotePatterns = snapshot.docs.map(d => d.data());
        pool = [...pool, ...remotePatterns];
      }
    } catch (err) {}
  }

  for (const pattern of pool) {
    let matchScore = 0;

    // Check authority similarity
    if (pattern.issuingAuthorityClaimed && normalizedAuthority.length > 3) {
      const patAuth = pattern.issuingAuthorityClaimed.toLowerCase();
      if (normalizedAuthority.includes(patAuth) || patAuth.includes(normalizedAuthority)) {
        matchScore += 2;
      }
    }

    // Check threat phrase matches
    if (Array.isArray(pattern.threatPhrases)) {
      for (const phrase of pattern.threatPhrases) {
        const cleanPhrase = phrase.toLowerCase().replace(/\[redacted_[a-z]+\]/g, '').trim();
        if (cleanPhrase.length > 6 && normalizedText.includes(cleanPhrase)) {
          matchScore += 3;
        }
      }
    }

    // Check payment method matches
    if (Array.isArray(pattern.paymentMethodsRequested)) {
      for (const method of pattern.paymentMethodsRequested) {
        const cleanMethod = method.toLowerCase();
        if (paymentMethods.some(p => p.toLowerCase().includes(cleanMethod)) || normalizedText.includes(cleanMethod)) {
          matchScore += 2;
        }
      }
    }

    if (matchScore >= 2 && !matchedPatterns.some(m => m.id === pattern.id)) {
      matchedPatterns.push({
        id: pattern.id,
        authority: pattern.issuingAuthorityClaimed,
        matchScore
      });
    }
  }

  return {
    matched: matchedPatterns.length > 0,
    matchCount: matchedPatterns.length,
    matchedPatterns
  };
}

module.exports = {
  recordCommunityScamPattern,
  matchAgainstCommunityScams,
  localScamPatternStore
};
