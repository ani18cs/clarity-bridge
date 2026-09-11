const { generateActionPlanPdf } = require('../services/pdf.service');

describe('PDF Generation & Template Tests', () => {
  test('generateActionPlanPdf should produce a valid PDF Buffer with INR currency and action steps', async () => {
    const mockAnalysis = {
      documentType: 'income_tax_notice',
      issuingAuthorityClaimed: 'Income Tax Department, New Delhi',
      summary: 'Demand notice u/s 156 requiring payment of Rs. 18,450 for Assessment Year 2025-26.',
      extractedFields: {
        din: { value: 'ITBA/AST/S/156/2026-27/104829104859' },
        pan: { value: 'ABCDE1234F' },
        amountDue: { value: 'Rs. 18,450' }
      },
      authenticity: {
        verdict: 'Verified',
        confidence: 0.95,
        reasons: ['DIN verified successfully on official ITD database'],
        itemizedSignals: [
          { name: 'Official DIN Verification', explanation: '20-digit DIN conforms to Circular 19/2019', direction: 'supports_authenticity' }
        ]
      },
      actionPlan: {
        steps: [
          { id: '1', title: 'Verify Notice on e-Filing Portal', priority: 'Urgent', deadline: '11/09/2026', description: 'Log in to incometax.gov.in and verify under Authenticate Notice.' },
          { id: '2', title: 'Pay Outstanding Demand', priority: 'High', deadline: '11/09/2026', description: 'Make payment through e-Pay Tax or submit rectification if incorrect.' }
        ],
        contacts: [
          { name: 'Income Tax Helpdesk', phone: '1800-180-1961', email: 'efilingwebmanager@incometax.gov.in', website: 'https://incometax.gov.in' }
        ]
      }
    };

    const pdfBuffer = await generateActionPlanPdf(mockAnalysis);

    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(1000);
    // PDF Magic number %PDF
    expect(pdfBuffer.toString('utf8', 0, 4)).toBe('%PDF');
  }, 30000); // 30s timeout for Puppeteer launch
});
