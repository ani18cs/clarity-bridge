const { generateActionPlanPdf, wrapText, truncate } = require('../services/pdf.service');

describe('PDF Generation Service Tests', () => {
  const sampleAnalysis = {
    id: 'test_doc_123',
    documentType: 'eviction_notice',
    issuingAuthorityClaimed: 'Municipal Court Clerk',
    summary: 'This is a formal 14-day notice to resolve past-due rent balance before housing mediation is initiated.',
    authenticity: {
      verdict: 'Verified',
      confidence: 0.94,
      reasons: ['Valid court citation format', 'Consistent timelines']
    },
    actionPlan: {
      summary: 'Submit emergency assistance form before September 22, 2026.',
      steps: [
        {
          id: 1,
          title: 'Apply for Emergency Tenant Aid',
          description: 'Contact the municipal housing relief office to file a stay.',
          priority: 'Urgent',
          deadline: '2026-09-18',
          contact: '(555) 234-5678'
        }
      ],
      contacts: [
        {
          name: 'Housing Assistance Hotline',
          phone: '(555) 234-5678',
          email: 'help@housing.gov'
        }
      ]
    }
  };

  test('generateActionPlanPdf should produce a valid PDF binary buffer', async () => {
    const pdfBuffer = await generateActionPlanPdf(sampleAnalysis);

    expect(pdfBuffer).toBeDefined();
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(1000);

    // Verify PDF Magic Bytes (%PDF-)
    const header = pdfBuffer.slice(0, 5).toString('ascii');
    expect(header).toBe('%PDF-');
  });

  test('wrapText utility should break long paragraphs correctly', () => {
    const longText = 'This is a very long descriptive paragraph intended to test whether line wrapping functions correctly without breaking words or exceeding line boundaries.';
    const lines = wrapText(longText, 30);

    expect(Array.isArray(lines)).toBe(true);
    expect(lines.length).toBeGreaterThan(1);
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(35);
    }
  });

  test('truncate utility should add ellipsis when length exceeds limit', () => {
    const text = 'A'.repeat(50);
    const truncated = truncate(text, 20);

    expect(truncated.length).toBe(20);
    expect(truncated.endsWith('...')).toBe(true);
  });
});
