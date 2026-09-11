/**
 * Structured Cloud Logging logger for Cloud Run
 * Formats logs as JSON without leaking sensitive document content, full text, or PII.
 */

function formatLog(severity, message, metadata = {}) {
  // Strip out any accidental sensitive payload fields
  const safeMetadata = { ...metadata };
  delete safeMetadata.text;
  delete safeMetadata.rawText;
  delete safeMetadata.content;
  delete safeMetadata.documentBody;
  delete safeMetadata.transcript;
  delete safeMetadata.buffer;
  delete safeMetadata.fileBuffer;
  delete safeMetadata.email;
  delete safeMetadata.phone;

  const logEntry = {
    severity,
    message,
    timestamp: new Date().toISOString(),
    service: 'clarity-bridge-backend',
    ...safeMetadata
  };

  if (process.env.NODE_ENV === 'test') {
    // Keep test output clean
    return;
  }

  // Cloud Run parses stdout JSON lines with severity levels
  console.log(JSON.stringify(logEntry));
}

const logger = {
  info: (msg, meta) => formatLog('INFO', msg, meta),
  warn: (msg, meta) => formatLog('WARNING', msg, meta),
  error: (msg, meta) => formatLog('ERROR', msg, meta),
  pipelineStage: (stageName, metadata = {}) => {
    formatLog('INFO', `Pipeline Stage: ${stageName}`, {
      stage: stageName,
      ...metadata
    });
  }
};

module.exports = logger;
