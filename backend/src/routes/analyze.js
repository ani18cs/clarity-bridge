const express = require('express');
const router = express.Router();
const { uploadFields } = require('../middleware/validateUpload');
const { optionalAuth } = require('../middleware/auth');
const logger = require('../middleware/logger');

const { analyzeDocument } = require('../services/gemini.service');
const { evaluateAuthenticity } = require('../services/authenticity.service');
const { verifyClaims } = require('../services/factcheck.service');
const { transcribeAudio } = require('../services/speech.service');
const { uploadFile } = require('../services/storage.service');
const { saveSubmission } = require('../services/firestore.service');

/**
 * POST /api/analyze
 * Main entry point for analyzing documents, audio, or text
 */
router.post('/', optionalAuth, uploadFields, async (req, res, next) => {
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

    // 2. Upload raw file to Cloud Storage (if file provided)
    let rawFileStorage = null;
    if (docFile) {
      const destination = `uploads/${userId}/${Date.now()}_${docFile.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      rawFileStorage = await uploadFile({
        buffer: docFile.buffer,
        destination,
        mimeType: docFile.mimetype
      });
    }

    // 3. Gemini Multimodal Extraction & Understanding
    const geminiResult = await analyzeDocument({
      fileBuffer: docFile?.buffer || null,
      mimeType: docFile?.mimetype || null,
      textContent: combinedText || null,
      language
    });

    // 4. Authenticity & Fraud Risk Evaluation
    const authenticity = evaluateAuthenticity({
      extractedFields: geminiResult.extractedFields || {},
      documentType: geminiResult.documentType || 'general_letter',
      issuingAuthorityClaimed: geminiResult.issuingAuthorityClaimed || '',
      rawText: combinedText,
      aiLinguisticSignal: geminiResult.aiLinguisticSignal || {}
    });

    // 5. Fact-Checking Layer
    const factChecks = await verifyClaims(
      geminiResult.claimsToCheck || [],
      { authority: geminiResult.issuingAuthorityClaimed }
    );

    // 6. Assemble Final Consolidated Output
    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const resultPayload = {
      id: submissionId,
      createdAt: new Date().toISOString(),
      inputType,
      documentType: geminiResult.documentType || 'general_document',
      issuingAuthorityClaimed: geminiResult.issuingAuthorityClaimed || 'Unknown',
      extractedFields: geminiResult.extractedFields || {},
      summary: geminiResult.summary || 'Summary unavailable.',
      actionPlan: geminiResult.actionPlan || { summary: '', steps: [], contacts: [] },
      authenticity,
      factChecks,
      language,
      voiceTranscript: voiceTranscript || null,
      rawFileUrl: rawFileStorage?.downloadUrl || rawFileStorage?.publicUrl || null,
      totalProcessingTimeMs: Date.now() - startTime
    };

    // 7. Persist to Firestore
    await saveSubmission(userId, resultPayload);

    logger.pipelineStage('Pipeline_Completed_Success', {
      submissionId,
      userId,
      documentType: resultPayload.documentType,
      verdict: authenticity.verdict,
      totalDurationMs: resultPayload.totalProcessingTimeMs
    });

    return res.status(200).json({
      success: true,
      data: resultPayload
    });
  } catch (err) {
    logger.error('Pipeline Execution Failed', { error: err.message, stack: err.stack });
    next(err);
  }
});

module.exports = router;
