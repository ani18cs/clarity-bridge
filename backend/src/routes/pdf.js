const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const { generateActionPlanPdf } = require('../services/pdf.service');
const { uploadFile } = require('../services/storage.service');
const logger = require('../middleware/logger');

/**
 * POST /api/pdf
 * Generates and returns a downloadable action plan PDF
 */
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const analysisData = req.body;
    if (!analysisData || (!analysisData.summary && !analysisData.actionPlan)) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Invalid payload. Analysis data with actionPlan or summary is required.'
      });
    }

    const pdfBuffer = await generateActionPlanPdf(analysisData);
    const userId = req.user?.uid || 'guest';
    const submissionId = analysisData.id || `doc_${Date.now()}`;

    // Optionally upload to Cloud Storage for persistent URL
    const destination = `pdfs/${userId}/${submissionId}_Action_Plan.pdf`;
    const storageResult = await uploadFile({
      buffer: pdfBuffer,
      destination,
      mimeType: 'application/pdf'
    });

    // Check if caller requests JSON with download URL or direct binary stream
    if (req.query.format === 'json') {
      return res.status(200).json({
        success: true,
        downloadUrl: storageResult.downloadUrl || storageResult.publicUrl,
        pdfBase64: pdfBuffer.toString('base64'),
        fileName: `ClarityBridge_Action_Plan_${submissionId}.pdf`
      });
    }

    // Default: stream binary PDF directly
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ClarityBridge_Action_Plan_${submissionId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.status(200).send(pdfBuffer);
  } catch (err) {
    logger.error('PDF Route Generation Failed', { error: err.message });
    next(err);
  }
});

module.exports = router;
