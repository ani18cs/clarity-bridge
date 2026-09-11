const { 
  validateGroundedExtractions, 
  dynamicallyParseDocumentContent,
  maskAadhaar
} = require('../services/gemini.service');
const { assessImageQuality } = require('../services/ocr.service');

describe('Grounded Extraction & Anti-Hallucination Tests', () => {
  test('Missing fields in document must return null or Not stated in document, never invented values', () => {
    const rawText = `INCOME TAX INTIMATION NOTICE
To: Priya Nair, PAN: ABCDE1234F
Assessment Year: 2025-26
Your return of income has been processed with nil balance payable or refundable.`;

    const parsed = dynamicallyParseDocumentContent({
      rawText,
      language: 'en'
    });

    expect(parsed.extractedFields.din.value).toBeNull();
    expect(parsed.extractedFields.gstin.value).toBeNull();
    // Deadline & amount are absent in raw text
    expect(parsed.extractedFields.amountDue.value).toBeNull();
    expect(parsed.extractedFields.dueDate.value).toBeNull();
  });

  test('Field with source_text missing from raw text must be flagged confidence: low', () => {
    const rawText = 'Routine office circular regarding holiday schedule on 15 August 2026.';
    
    const ungroundedFields = {
      amountDue: {
        value: 'Rs. 50,000',
        source_text: 'You owe Rs 50000 immediately to the office' // Fabricated text not in rawText
      },
      noticeDate: {
        value: '15 August 2026',
        source_text: '15 August 2026' // Actually in rawText
      }
    };

    const validated = validateGroundedExtractions(ungroundedFields, rawText);

    expect(validated.amountDue.confidence).toBe('low');
    expect(validated.amountDue.unverifiedWarning).toContain('Could not verify from the document');
    expect(validated.noticeDate.confidence).toBe('high');
  });

  test('UIDAI Aadhaar 4-digit masking rule enforces XXXX-XXXX-1234 on all extractions', () => {
    const rawText = 'Citizen Aadhaar number is 5432 9876 1234 submitted for KYC verification.';
    const masked = maskAadhaar(rawText);

    expect(masked).not.toContain('5432 9876 1234');
    expect(masked).toContain('XXXX-XXXX-1234');
  });

  test('Low-quality / tiny blurry image buffers trigger quality warning and retake recommendation', async () => {
    // Tiny invalid buffer simulating unreadable/corrupted photo
    const tinyBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
    const quality = await assessImageQuality(tinyBuffer);

    expect(quality.isValid).toBe(false);
    expect(quality.needsRetake).toBe(true);
    expect(quality.warning).toBeDefined();
    expect(quality.warning.recommendation).toContain('retake');
  });
});
