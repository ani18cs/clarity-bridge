const { generateMockAnalysis, dynamicallyParseDocumentContent } = require('../services/gemini.service');

describe('Gemini Service Logic & Mock Extraction Tests', () => {
  test('dynamicallyParseDocumentContent should correctly extract official document fields', () => {
    const mockDoc = dynamicallyParseDocumentContent({
      rawText: 'METRO HOUSING AUTHORITY\nOfficial Eviction notice demanding past due balance of $1,200',
      language: 'en'
    });

    expect(mockDoc).toBeDefined();
    expect(mockDoc.documentTypeEnum).toBe('eviction_housing_notice');
    expect(mockDoc.documentType).toContain('Eviction Notice');
    expect(mockDoc.issuingAuthorityClaimed).toContain('METRO HOUSING AUTHORITY');
    expect(mockDoc.extractedFields).toHaveProperty('amountDue');
    expect(mockDoc.actionPlan.steps.length).toBeGreaterThan(0);
    expect(mockDoc.actionPlan.steps[0]).toHaveProperty('priority');
    expect(mockDoc.actionPlan.steps[0]).toHaveProperty('deadline');
  });

  test('dynamicallyParseDocumentContent should classify scam keywords appropriately', () => {
    const mockScam = dynamicallyParseDocumentContent({
      rawText: 'INTERNAL REVENUE POLICE: Urgent notice: Pay with Apple gift cards or arrest warrant will issue immediately!',
      language: 'en'
    });

    expect(mockScam.documentTypeEnum).toBe('suspicious_solicitation');
    expect(mockScam.documentType).toContain('Suspicious');
    expect(mockScam.extractedFields.paymentMethodsRequested).toContain('Apple Gift Cards');
    expect(mockScam.aiLinguisticSignal.score).toBeGreaterThan(0.7);
  });
});
