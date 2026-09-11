const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { uploadFields } = require('../middleware/validateUpload');
const { optionalAuth } = require('../middleware/auth');
const logger = require('../middleware/logger');

const { analyzeDocument } = require('../services/gemini.service');
const { evaluateAuthenticity } = require('../services/authenticity.service');
const { verifyClaims } = require('../services/factcheck.service');
const { transcribeAudio } = require('../services/speech.service');
const { uploadFile } = require('../services/storage.service');
const { saveSubmission } = require('../services/firestore.service');
const { translateAnalysisData } = require('../services/translation.service');

// Rate limiting: 30 analysis requests per 15 minutes per user
const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : 30,
  keyGenerator: (req) => req.user?.uid || req.ip || 'anonymous',
  validate: { default: false },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'RateLimitExceeded',
    message: 'Too many analysis requests. Please wait a few moments before trying again.'
  }
});

/**
 * POST /api/analyze
 * Main entry point for analyzing documents, audio, or text
 * Optimized with concurrent promise pipelining for maximum throughput and minimal latency.
 *
 * @route POST /api/analyze
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
router.post('/', optionalAuth, analyzeLimiter, uploadFields, async (req, res, next) => {
  const startTime = Date.now();
  const userId = req.user?.uid || 'anonymous_user';

  try {
    const files = req.files || {};
    const docFile = files.file ? files.file[0] : null;
    const audioFile = files.audio ? files.audio[0] : null;
    const textInput = (req.body.text || '').trim();
    const language = req.body.language || 'en';

    if (!docFile && !audioFile && !textInput) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Please provide a document file (image/PDF), voice audio recording, or pasted text.'
      });
    }

    let inputType = 'text';
    if (docFile) {
      inputType = docFile.mimetype.includes('pdf') ? 'pdf' : 'image';
    } else if (audioFile) {
      inputType = 'voice';
    }

    logger.pipelineStage('Pipeline_Initiated', {
      userId,
      inputType,
      hasDocFile: !!docFile,
      hasAudioFile: !!audioFile,
      hasText: !!textInput,
      language
    });

    // 1. Ingest audio if present -> Transcribe to text
    let voiceTranscript = '';
    if (audioFile) {
      voiceTranscript = await transcribeAudio(audioFile.buffer, audioFile.mimetype);
    }

    // Combine any user text input with voice transcript
    const combinedText = [textInput, voiceTranscript ? `[Voice Input]: ${voiceTranscript}` : '']
      .filter(Boolean)
      .join('\n\n');

    // 2 & 3. Concurrent Execution: Upload to GCS and Gemini Multimodal Analysis in Parallel
    const storagePromise = docFile
      ? uploadFile({
          buffer: docFile.buffer,
          destination: `uploads/${userId}/${Date.now()}_${docFile.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
          mimeType: docFile.mimetype
        }).catch((err) => {
          logger.warn('Non-blocking GCS upload error', { error: err.message });
          return null;
        })
      : Promise.resolve(null);

    const geminiPromise = analyzeDocument({
      fileBuffer: docFile?.buffer || null,
      mimeType: docFile?.mimetype || null,
      textContent: combinedText || null,
      language
    });

    const [rawFileStorage, geminiResult] = await Promise.all([storagePromise, geminiPromise]);

    // 4 & 5. Concurrent Execution: Authenticity Evaluation and Fact-Checking in Parallel
    const authenticityPromise = evaluateAuthenticity({
      extractedFields: geminiResult.extractedFields || {},
      documentType: geminiResult.documentType || 'general_letter',
      issuingAuthorityClaimed: geminiResult.issuingAuthorityClaimed || '',
      rawText: combinedText,
      aiLinguisticSignal: geminiResult.aiLinguisticSignal || {}
    });

    const factCheckPromise = verifyClaims(
      geminiResult.claimsToCheck || [],
      { authority: geminiResult.issuingAuthorityClaimed }
    );

    const [authenticity, factChecks] = await Promise.all([authenticityPromise, factCheckPromise]);

    // 6. Assemble Final Consolidated Output
    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const resultPayload = {
      id: submissionId,
      createdAt: new Date().toISOString(),
      inputType,
      documentType: geminiResult.documentType || 'general_document',
      issuingAuthorityClaimed: geminiResult.issuingAuthorityClaimed || 'Unknown',
      documentPurpose: geminiResult.documentPurpose || 'General document content and documentation.',
      extractedFields: geminiResult.extractedFields || {},
      summary: geminiResult.summary || 'Summary unavailable.',
      legalImplications: geminiResult.legalImplications || [],
      citizenRights: geminiResult.citizenRights || [],
      jargonDemystified: geminiResult.jargonDemystified || [],
      actionPlan: geminiResult.actionPlan || { summary: '', steps: [], contacts: [] },
      authenticity,
      factChecks,
      language,
      voiceTranscript: voiceTranscript || null,
      rawFileUrl: rawFileStorage?.downloadUrl || rawFileStorage?.publicUrl || null,
      totalProcessingTimeMs: Date.now() - startTime
    };

    let finalPayload = resultPayload;
    if (language && language !== 'en') {
      finalPayload = translateAnalysisData(resultPayload, language);
    }

    // 7. Persist to Firestore (Non-blocking background save)
    saveSubmission(userId, finalPayload).catch((err) => {
      logger.warn('Non-blocking Firestore save warning', { error: err.message });
    });

    logger.pipelineStage('Pipeline_Completed_Success', {
      submissionId,
      userId,
      documentType: finalPayload.documentType,
      verdict: authenticity.verdict,
      totalDurationMs: finalPayload.totalProcessingTimeMs
    });

    return res.status(200).json({
      success: true,
      data: finalPayload
    });
  } catch (err) {
    logger.error('Pipeline Execution Failed', { error: err.message, stack: err.stack });
    next(err);
  }
});

module.exports = router;
