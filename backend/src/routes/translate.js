const express = require('express');
const router = express.Router();
const { translateAnalysisData } = require('../services/translation.service');
const logger = require('../middleware/logger');

/**
 * POST /api/translate
 * Translates an existing document analysis payload into a new target language
 */
router.post('/', async (req, res, next) => {
  try {
    const { analysisData, targetLanguage = 'en' } = req.body;

    if (!analysisData) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Missing analysisData in request body.'
      });
    }

    const translatedData = translateAnalysisData(analysisData, targetLanguage);

    logger.info('Translated document analysis', {
      documentType: translatedData.documentType,
      targetLanguage
    });

    return res.status(200).json({
      success: true,
      data: translatedData
    });
  } catch (err) {
    logger.error('Translation failed', { error: err.message });
    next(err);
  }
});

module.exports = router;
