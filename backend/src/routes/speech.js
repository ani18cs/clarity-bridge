const express = require('express');
const router = express.Router();
const { uploadSingleAudio } = require('../middleware/validateUpload');
const { transcribeAudio, synthesizeSpeech } = require('../services/speech.service');
const logger = require('../middleware/logger');

/**
 * POST /api/speech/transcribe
 * Transcribes an audio recording file into text
 */
router.post('/transcribe', uploadSingleAudio, async (req, res, next) => {
  try {
    const audioFile = req.file;
    if (!audioFile) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'No audio file provided in request.'
      });
    }

    const transcript = await transcribeAudio(audioFile.buffer, audioFile.mimetype);
    return res.status(200).json({
      success: true,
      transcript
    });
  } catch (err) {
    logger.error('Speech Transcription Route Failed', { error: err.message });
    next(err);
  }
});

/**
 * POST /api/speech/synthesize
 * Converts summary text into audio speech
 */
router.post('/synthesize', async (req, res, next) => {
  try {
    const { text, languageCode = 'en-US' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Text string is required for speech synthesis.'
      });
    }

    const result = await synthesizeSpeech(text, languageCode);
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (err) {
    logger.error('Speech Synthesis Route Failed', { error: err.message });
    next(err);
  }
});

module.exports = router;
