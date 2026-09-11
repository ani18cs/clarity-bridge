const { generateMockAnalysis } = require('../services/gemini.service');

describe('Gemini Service Logic & Mock Extraction Tests', () => {
  test('generateMockAnalysis should correctly extract official document fields', () => {
    const mockDoc = generateMockAnalysis({
      textContent: 'Official Eviction notice demanding past due balance',
      language: 'en'
    });

    expect(mockDoc).toBeDefined();
    expect(mockDoc.documentType).toBe('eviction_notice');
    expect(mockDoc.issuingAuthorityClaimed).toContain('Metro Housing');
    expect(mockDoc.extractedFields).toHaveProperty('amountDue');
    expect(mockDoc.actionPlan.steps.length).toBeGreaterThan(0);
    expect(mockDoc.actionPlan.steps[0]).toHaveProperty('priority');
    expect(mockDoc.actionPlan.steps[0]).toHaveProperty('deadline');
  });

  test('generateMockAnalysis should classify scam keywords appropriately', () => {
    const mockScam = generateMockAnalysis({
      textContent: 'Urgent notice: Pay with Apple gift cards or arrest warrant will issue immediately!',
      language: 'en'
    });

    expect(mockScam.documentType).toBe('suspicious_solicitation');
    expect(mockScam.extractedFields.paymentMethodsRequested).toContain('Apple Gift Cards');
    expect(mockScam.aiLinguisticSignal.score).toBeGreaterThan(0.7);
  });
});
