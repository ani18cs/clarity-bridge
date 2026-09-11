const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const { getUserSubmissions, getSubmissionById } = require('../services/firestore.service');
const logger = require('../middleware/logger');

/**
 * GET /api/history
 * Fetch past document submissions for the user
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.uid || 'guest';
    const submissions = await getUserSubmissions(userId);

    logger.info('History fetched', { userId, count: submissions.length });

    return res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (err) {
    logger.error('History Fetch Failed', { error: err.message });
    next(err);
  }
});

/**
 * GET /api/history/:id
 * Fetch single submission details
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.uid || 'guest';
    const submissionId = req.params.id;

    const submission = await getSubmissionById(userId, submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'NotFound',
        message: 'Submission not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: submission
    });
  } catch (err) {
    logger.error('History Item Fetch Failed', { error: err.message });
    next(err);
  }
});

module.exports = router;
