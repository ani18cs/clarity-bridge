const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { firestoreDb } = require('../config/firebaseAdmin');
const logger = require('../middleware/logger');

// Local in-memory store for shared submissions (fallback & test environment)
const localShareStore = new Map();

/**
 * POST /api/share
 * Generates a scoped, unguessable, read-only shareable link with 7-day expiration
 */
router.post('/', async (req, res, next) => {
  try {
    const analysisData = req.body;
    if (!analysisData || !analysisData.summary) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Invalid payload. Analysis data is required.'
      });
    }

    // Generate random 16-character hex token (unguessable ID)
    const shareToken = crypto.randomBytes(8).toString('hex');
    const shareId = `CB-${shareToken}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    // Sanitize payload to strip any internal session info or raw storage paths
    const sanitizedSharedData = {
      shareId,
      createdAt: new Date().toISOString(),
      expiresAt,
      documentType: analysisData.documentType || 'general_document',
      issuingAuthorityClaimed: analysisData.issuingAuthorityClaimed || 'Unknown',
      documentPurpose: analysisData.documentPurpose || '',
      summary: analysisData.summary || '',
      extractedFields: analysisData.extractedFields || {},
      actionPlan: analysisData.actionPlan || { summary: '', steps: [], contacts: [] },
      authenticity: {
        verdict: analysisData.authenticity?.verdict || 'Verified',
        confidence: analysisData.authenticity?.confidence || 0.9,
        reasons: analysisData.authenticity?.reasons || [],
        itemizedSignals: analysisData.authenticity?.itemizedSignals || []
      },
      factChecks: analysisData.factChecks || [],
      language: analysisData.language || 'en',
      disclaimer: 'Shared via ClarityBridge — an assistive translation/triage tool, not a lawyer or government agency.'
    };

    // Store in local memory
    localShareStore.set(shareId, sanitizedSharedData);

    // If Firestore is available, persist to sharedSubmissions collection
    if (firestoreDb && process.env.NODE_ENV !== 'test') {
      try {
        await firestoreDb.collection('sharedSubmissions').doc(shareId).set(sanitizedSharedData);
      } catch (err) {
        logger.warn('Failed to save shared submission to Firestore — using memory', { error: err.message });
      }
    }

    logger.info('Created shared submission link', { shareId, expiresAt });

    const host = req.get('host') || 'localhost:5173';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const shareUrl = `${protocol}://${host}/shared/${shareId}`;

    return res.status(200).json({
      success: true,
      data: {
        shareId,
        shareUrl,
        expiresAt
      }
    });
  } catch (err) {
    logger.error('Failed to create share link', { error: err.message });
    next(err);
  }
});

/**
 * GET /api/share/:shareId
 * Public read-only endpoint to retrieve a shared document analysis
 */
router.get('/:shareId', async (req, res, next) => {
  try {
    const { shareId } = req.params;
    let sharedRecord = localShareStore.get(shareId);

    if (!sharedRecord && firestoreDb && process.env.NODE_ENV !== 'test') {
      try {
        const doc = await firestoreDb.collection('sharedSubmissions').doc(shareId).get();
        if (doc.exists) {
          sharedRecord = doc.data();
        }
      } catch (err) {}
    }

    if (!sharedRecord) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'This shared link does not exist or has expired.'
      });
    }

    // Check 7-day expiration
    if (sharedRecord.expiresAt && new Date(sharedRecord.expiresAt) < new Date()) {
      return res.status(410).json({
        success: false,
        error: 'LinkExpired',
        message: 'This shared link has expired.'
      });
    }

    return res.status(200).json({
      success: true,
      data: sharedRecord
    });
  } catch (err) {
    logger.error('Failed to fetch shared submission', { error: err.message });
    next(err);
  }
});

module.exports = router;
