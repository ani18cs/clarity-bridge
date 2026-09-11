const { evaluateAuthenticity } = require('../services/authenticity.service');

describe('Authenticity Refinement & False-Positive Prevention Tests', () => {
  test('Routine legitimate informational notice with no red flags must NOT be flagged Likely Fraudulent or Use Caution', async () => {
    const legitimateNotice = {
      documentType: 'income_tax_notice',
      issuingAuthorityClaimed: 'Income Tax Department of India',
      extractedFields: {
        din: { value: '10482910485910482910', source_text: 'DIN: 10482910485910482910', confidence: 'high' },
        pan: { value: 'ABCDE1234F', source_text: 'PAN: ABCDE1234F', confidence: 'high' },
        noticeDate: { value: '12/08/2026', source_text: '12/08/2026', confidence: 'high' },
        dueDate: { value: '11/09/2026', source_text: 'within thirty (30) days', confidence: 'high' },
        contactWebsite: 'https://eportal.incometax.gov.in',
        contactEmail: 'efilingwebmanager@incometax.gov.in',
        paymentMethodsRequested: ['Official e-Filing Portal']
      },
      rawText: `GOVERNMENT OF INDIA - INCOME TAX DEPARTMENT
Document Identification Number (DIN): 10482910485910482910
PAN: ABCDE1234F | Notice Date: 12/08/2026
Demand payable within 30 days via https://eportal.incometax.gov.in`
    };

    const verdict = await evaluateAuthenticity(legitimateNotice);

    expect(verdict.verdict).toBe('Verified');
    expect(verdict.verdict).not.toBe('Likely Fraudulent');
    expect(verdict.verdict).not.toBe('Use Caution');
    expect(verdict.itemizedSignals.some(s => (s.id === 'india_din_check' || s.id === 'din_verification') && s.direction === 'supports_authenticity')).toBe(true);
  });

  test('Single mild red flag alone must NOT reach Likely Fraudulent (must return Use Caution)', async () => {
    const singleFlagDoc = {
      documentType: 'municipal_state_notice',
      issuingAuthorityClaimed: 'Municipal Corporation Water Board',
      extractedFields: {
        noticeDate: { value: '01/09/2026' },
        dueDate: { value: '30/09/2026' },
        contactWebsite: 'https://city-water-help.com' // Unverified domain is a single red flag
      },
      rawText: 'Municipal Corporation Water Department: Regular bill for September 2026. Please remit on our portal.'
    };

    const verdict = await evaluateAuthenticity(singleFlagDoc);

    expect(verdict.verdict).toBe('Use Caution');
    expect(verdict.verdict).not.toBe('Likely Fraudulent');
  });

  test('At least 2 independent red flags must agree before returning Likely Fraudulent', async () => {
    const fraudDoc = {
      documentType: 'bank_nbfc_notice',
      issuingAuthorityClaimed: 'Special Recovery Police Force',
      extractedFields: {
        contactEmail: 'recovery.agent.instant@gmail.com', // Flag 1: Free public email for official claim
        paymentMethodsRequested: ['Google Play Gift Cards', 'UPI Transfer'] // Flag 2: Coercive/banned payment method
      },
      rawText: 'FINAL POLICE ARREST NOTICE: Pay immediately via Google Play Gift Cards to cancel arrest warrant within 2 hours or police will raid.'
    };

    const verdict = await evaluateAuthenticity(fraudDoc);

    expect(verdict.verdict).toBe('Likely Fraudulent');
    expect(verdict.confidence).toBeGreaterThan(0.8);
  });

  test('Conflicting signals or low extraction confidence return Needs Manual Review', async () => {
    const conflictingDoc = {
      documentType: 'income_tax_notice',
      issuingAuthorityClaimed: 'Income Tax Department',
      needsManualReview: true, // Explicit low confidence flag
      extractedFields: {
        contactWebsite: 'https://incometax.gov.in' // Official domain passes
      },
      rawText: 'Blurred scan of a tax paper'
    };

    const verdict = await evaluateAuthenticity(conflictingDoc);

    expect(verdict.verdict).toBe('Needs Manual Review');
    expect(verdict.reasons[0]).toContain('Uncertain or conflicting signals');
  });

  test('Income Tax Notice without 20-digit DIN flags statutory invalidity under Circular 19/2019', async () => {
    const missingDinNotice = {
      documentType: 'income_tax_notice',
      issuingAuthorityClaimed: 'Income Tax Department',
      extractedFields: {
        noticeDate: { value: '15/05/2026' },
        din: { value: null } // Missing statutory DIN
      },
      rawText: 'Income Tax Demand Notice demanding Rs 25000 under section 156 without any DIN number.'
    };

    const verdict = await evaluateAuthenticity(missingDinNotice);

    expect(verdict.itemizedSignals.some(s => (s.id === 'india_din_check' || s.id === 'din_verification') && s.direction === 'indicates_suspicion')).toBe(true);
    expect(verdict.reasons.some(r => r.includes('DIN') || r.includes('Circular 19/2019'))).toBe(true);
  });
});
