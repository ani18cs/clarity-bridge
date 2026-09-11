/**
 * PII Scrubber Utility
 * Scrubs personally identifiable information (PII) such as phone numbers,
 * email addresses, Indian PAN, Indian Aadhaar, credit cards, and bank account numbers
 * before saving any patterns to the shared community pool.
 */

// Regex patterns for Indian and international PII
const PII_PATTERNS = {
  // 1. Email address
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,

  // 2. Indian PAN: 5 uppercase letters, 4 digits, 1 uppercase letter (e.g. ABCDE1234F)
  pan: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/gi,

  // 3. Credit Card numbers (16 digits: 4 groups of 4 separated by space/dash or 16 continuous digits)
  creditCard: /\b(?:\d{4}[-\s]){3}\d{4}\b|\b\d{16}\b/g,

  // 4. Indian Aadhaar: 12 digits (3 groups of 4 or 12 continuous digits)
  aadhaar: /\b\d{4}\s\d{4}\s\d{4}\b|\b\d{12}\b/g,

  // 5. Standalone long bank account numbers (13 to 18 consecutive digits)
  bankAccount: /\b\d{13,18}\b/g,

  // 6. Phone numbers (Indian mobile starting 6-9 with optional +91, or international formats with parentheses/dashes)
  phone: /(?:\+91[\-\s]?)?[6-9]\d{9}\b|\(\d{3}\)\s*\d{3}[-.\s]?\d{4}\b|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/g
};

/**
 * Scrub all PII from a given string in precise order
 * @param {string} text - Raw input string
 * @returns {string} - Scrubbed string with PII replaced by placeholders
 */
function scrubPII(text = '') {
  if (typeof text !== 'string') return '';

  let cleaned = text;

  // 1. Scrub Email
  cleaned = cleaned.replace(PII_PATTERNS.email, '[REDACTED_EMAIL]');

  // 2. Scrub PAN
  cleaned = cleaned.replace(PII_PATTERNS.pan, '[REDACTED_PAN]');

  // 3. Scrub Credit Cards (16 digits)
  cleaned = cleaned.replace(PII_PATTERNS.creditCard, '[REDACTED_CARD]');

  // 4. Scrub Bank Account Numbers (13-18 digits)
  cleaned = cleaned.replace(PII_PATTERNS.bankAccount, '[REDACTED_ACCOUNT]');

  // 5. Scrub Aadhaar (12 digits)
  cleaned = cleaned.replace(PII_PATTERNS.aadhaar, '[REDACTED_AADHAAR]');

  // 6. Scrub Phone Numbers
  cleaned = cleaned.replace(PII_PATTERNS.phone, '[REDACTED_PHONE]');

  return cleaned;
}

/**
 * Scrub an object containing extracted fields before community submission
 * @param {Object} data - Extracted document fields
 * @returns {Object} - Anonymized, PII-scrubbed pattern object
 */
function scrubPatternObject(data = {}) {
  const scrubbed = {
    documentType: data.documentType || 'unknown',
    issuingAuthorityClaimed: scrubPII(data.issuingAuthorityClaimed || 'Unknown'),
    threatPhrases: Array.isArray(data.threatPhrases) 
      ? data.threatPhrases.map(p => scrubPII(p))
      : [],
    paymentMethodsRequested: Array.isArray(data.paymentMethodsRequested)
      ? data.paymentMethodsRequested.map(m => scrubPII(m))
      : [],
    suspiciousKeywords: Array.isArray(data.suspiciousKeywords)
      ? data.suspiciousKeywords.map(k => scrubPII(k))
      : [],
    scrubbedSummary: scrubPII(data.summary || '').substring(0, 300),
    reportedAt: new Date().toISOString()
  };

  return scrubbed;
}

module.exports = {
  scrubPII,
  scrubPatternObject,
  PII_PATTERNS
};
