const { scrubPII, scrubPatternObject } = require('../utils/piiScrubber');

describe('PII Scrubber Utility Tests (Community Scam Security Guardrail)', () => {
  test('should redact Indian PAN card numbers', () => {
    const raw = 'The taxpayer PAN is ABCDE1234F and second PAN is WXYZP9876Q.';
    const scrubbed = scrubPII(raw);
    expect(scrubbed).not.toContain('ABCDE1234F');
    expect(scrubbed).not.toContain('WXYZP9876Q');
    expect(scrubbed).toContain('[REDACTED_PAN]');
  });

  test('should redact 12-digit Indian Aadhaar numbers (with and without spaces)', () => {
    const raw = 'Resident Aadhaar: 1234 5678 9012 and unformatted: 987654321098.';
    const scrubbed = scrubPII(raw);
    expect(scrubbed).not.toContain('1234 5678 9012');
    expect(scrubbed).not.toContain('987654321098');
    expect(scrubbed).toContain('[REDACTED_AADHAAR]');
  });

  test('should redact email addresses', () => {
    const raw = 'Send recovery fee to official.recovery.desk@fake-irs-portal.com or support@gmail.com.';
    const scrubbed = scrubPII(raw);
    expect(scrubbed).not.toContain('official.recovery.desk@fake-irs-portal.com');
    expect(scrubbed).not.toContain('support@gmail.com');
    expect(scrubbed).toContain('[REDACTED_EMAIL]');
  });

  test('should redact Indian and international phone numbers', () => {
    const raw = 'Call agent immediately at +91 9876543210 or 9876543210 or (555) 234-5678.';
    const scrubbed = scrubPII(raw);
    expect(scrubbed).not.toContain('9876543210');
    expect(scrubbed).not.toContain('(555) 234-5678');
    expect(scrubbed).toContain('[REDACTED_PHONE]');
  });

  test('should redact credit card numbers', () => {
    const raw = 'Target credit card: 4111 2222 3333 4444 to authorize release.';
    const scrubbed = scrubPII(raw);
    expect(scrubbed).not.toContain('4111 2222 3333 4444');
    expect(scrubbed).toContain('[REDACTED_CARD]');
  });

  test('should redact long bank account numbers without removing short dates/amounts', () => {
    const raw = 'Remit balance of $500 to Account No: 12345678901234 by 2026.';
    const scrubbed = scrubPII(raw);
    expect(scrubbed).not.toContain('12345678901234');
    expect(scrubbed).toContain('[REDACTED_ACCOUNT]');
    expect(scrubbed).toContain('$500');
    expect(scrubbed).toContain('2026');
  });

  test('scrubPatternObject should scrub all nested fields before community pool write', () => {
    const unsafePattern = {
      documentType: 'suspicious_solicitation',
      issuingAuthorityClaimed: 'Officer Sharma from +91 9876543210',
      threatPhrases: [
        'Arrest warrant for PAN ABCDE1234F issued today',
        'Send funds from Aadhaar 1234 5678 9012'
      ],
      paymentMethodsRequested: ['Apple Cards to victim.help@scam.org'],
      suspiciousKeywords: ['Immediate arrest', 'Call 9876543210'],
      summary: 'Personal notice sent to victim email victim@test.com with phone 9876543210.'
    };

    const scrubbedObj = scrubPatternObject(unsafePattern);

    expect(scrubbedObj.issuingAuthorityClaimed).toContain('[REDACTED_PHONE]');
    expect(scrubbedObj.issuingAuthorityClaimed).not.toContain('9876543210');

    expect(scrubbedObj.threatPhrases[0]).toContain('[REDACTED_PAN]');
    expect(scrubbedObj.threatPhrases[0]).not.toContain('ABCDE1234F');

    expect(scrubbedObj.threatPhrases[1]).toContain('[REDACTED_AADHAAR]');
    expect(scrubbedObj.threatPhrases[1]).not.toContain('1234 5678 9012');

    expect(scrubbedObj.paymentMethodsRequested[0]).toContain('[REDACTED_EMAIL]');
    expect(scrubbedObj.paymentMethodsRequested[0]).not.toContain('victim.help@scam.org');

    expect(scrubbedObj.scrubbedSummary).not.toContain('victim@test.com');
    expect(scrubbedObj.scrubbedSummary).not.toContain('9876543210');
  });
});
