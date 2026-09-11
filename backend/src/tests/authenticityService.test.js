const { evaluateAuthenticity } = require('../services/authenticity.service');

describe('Authenticity & Fraud Evaluation Tests', () => {
  test('Legitimate government document with official domain and consistent dates should be Verified', async () => {
    const result = await evaluateAuthenticity({
      documentType: 'eviction_notice',
      issuingAuthorityClaimed: 'Municipal Housing Court',
      extractedFields: {
        noticeDate: '2026-09-01',
        dueDate: '2026-09-15',
        contactWebsite: 'https://housing.citygov.gov',
        paymentMethodsRequested: ['Official Tenant Portal']
      },
      rawText: 'Notice to cure rent'
    });

    expect(result.verdict).toBe('Verified');
    expect(result.confidence).toBeGreaterThan(0.7);
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(Array.isArray(result.itemizedSignals)).toBe(true);
  });

  test('Claimed government agency with free public gmail address should trigger red flag', async () => {
    const result = await evaluateAuthenticity({
      documentType: 'tax_bill',
      issuingAuthorityClaimed: 'IRS Department of Revenue',
      extractedFields: {
        contactEmail: 'official.irs.agent8921@gmail.com',
        contactWebsite: 'http://irs-clearance-tax.info'
      },
      rawText: 'Pay tax penalty'
    });

    expect(result.verdict).toMatch(/Likely Fraudulent|Use Caution/);
    expect(result.reasons.some(r => r.includes('free public email'))).toBe(true);
  });

  test('Document demanding payment via gift cards or crypto should be flagged Likely Fraudulent', async () => {
    const result = await evaluateAuthenticity({
      documentType: 'suspicious_solicitation',
      issuingAuthorityClaimed: 'Federal Police Department',
      extractedFields: {
        paymentMethodsRequested: ['Target Gift Cards', 'Bitcoin Wallet']
      },
      rawText: 'You must purchase $500 in Apple gift cards immediately to cancel your arrest warrant within 2 hours.'
    });

    expect(result.verdict).toBe('Likely Fraudulent');
    expect(result.reasons.some(r => r.includes('gift cards'))).toBe(true);
    expect(result.reasons.some(r => r.includes('threats'))).toBe(true);
  });

  test('Document with ambiguous signals should be flagged Use Caution', async () => {
    const result = await evaluateAuthenticity({
      documentType: 'official_government_notice',
      issuingAuthorityClaimed: 'State Department of Revenue',
      extractedFields: {
        noticeDate: '2026-09-01',
        dueDate: '2026-09-15',
        contactWebsite: 'https://state-tax-portal.com' // Non .gov domain for government claim
      },
      rawText: 'Dear citizen, please review your annual filing assessment.'
    });

    expect(result.verdict).toBe('Use Caution');
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  test('Document with due date before notice date should flag inconsistent dates', async () => {
    const result = await evaluateAuthenticity({
      documentType: 'utility_shutoff',
      issuingAuthorityClaimed: 'City Power & Light',
      extractedFields: {
        noticeDate: '2026-09-20',
        dueDate: '2026-09-10' // Due before issued
      },
      rawText: 'Final notice'
    });

    expect(result.reasons.some(r => r.includes('Inconsistent dates'))).toBe(true);
  });
});
