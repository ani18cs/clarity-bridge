const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { recordCommunityScamPattern, localScamPatternStore } = require('../services/communityScam.service');
const { scrubPII } = require('../utils/piiScrubber');
const logger = require('../middleware/logger');

// Rate limiting: max 20 scam reports per hour per IP
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : 20,
  keyGenerator: (req) => req.user?.uid || req.ip || 'anonymous',
  validate: { default: false },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'RateLimitExceeded',
    message: 'Too many scam reports submitted from this address. Please try again later.'
  }
});

/**
 * POST /api/community-scam/report
 * Adds an anonymized, PII-scrubbed fraud pattern to the shared community scam pool
 */
router.post('/report', reportLimiter, async (req, res, next) => {
  try {
    const { 
      documentType, 
      issuingAuthorityClaimed, 
      threatPhrases, 
      paymentMethodsRequested, 
      suspiciousKeywords,
      summary
    } = req.body;

    if (!issuingAuthorityClaimed && (!threatPhrases || threatPhrases.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Must provide either a claimed issuing authority or threat phrases to record a scam pattern.'
      });
    }

    logger.pipelineStage('Community_Scam_Report_Received', {
      documentType: documentType || 'unknown',
      threatPhrasesCount: Array.isArray(threatPhrases) ? threatPhrases.length : 0
    });

    // Record pattern with mandatory PII scrubbing applied
    const recordedRecord = await recordCommunityScamPattern({
      documentType: documentType || 'suspicious_solicitation',
      issuingAuthorityClaimed: issuingAuthorityClaimed || 'Unknown Solicitor',
      threatPhrases: Array.isArray(threatPhrases) ? threatPhrases : [],
      paymentMethodsRequested: Array.isArray(paymentMethodsRequested) ? paymentMethodsRequested : [],
      suspiciousKeywords: Array.isArray(suspiciousKeywords) ? suspiciousKeywords : [],
      summary: summary || ''
    });

    return res.status(200).json({
      success: true,
      message: 'Scam pattern safely anonymized and added to the shared Community Scam Database.',
      data: {
        patternId: recordedRecord.id,
        reportedAt: recordedRecord.reportedAt,
        scrubbedAuthority: recordedRecord.issuingAuthorityClaimed
      }
    });
  } catch (err) {
    logger.error('Failed to report community scam pattern', { error: err.message });
    next(err);
  }
});

/**
 * GET /api/community-scam/stats
 * Public read-only statistics on community scam patterns
 */
router.get('/stats', (req, res) => {
  res.status(200).json({
    success: true,
    totalPatternsTracked: localScamPatternStore.length,
    description: 'Shared anonymized community fraud and coercion pattern database'
  });
});

module.exports = router;
