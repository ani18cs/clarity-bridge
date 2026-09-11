const { verifyClaims, verifySingleClaim } = require('../services/factcheck.service');

describe('Fact-Checking Service Tests', () => {
  test('verifySingleClaim should detect and contradict scam payment demands', async () => {
    const scamClaim = 'Payment via Bitcoin or Apple gift card is mandatory to avoid police dispatch.';
    const result = await verifySingleClaim(scamClaim);

    expect(result.status).toBe('Contradicted');
    expect(result.source).toContain('ftc.gov');
    expect(result.notes).toContain('Contradicted by federal consumer protection standards');
  });

  test('verifySingleClaim should verify statutory legal references', async () => {
    const legalClaim = 'Tenant has a 14-day statutory cure window under State Housing Code Section 504.';
    const result = await verifySingleClaim(legalClaim);

    expect(result.status).toBe('Verified');
    expect(result.source).toBeDefined();
  });

  test('verifySingleClaim should tag unverifiable private assertions appropriately', async () => {
    const privateClaim = 'The landlord spoke with the tenant on August 14th.';
    const result = await verifySingleClaim(privateClaim);

    expect(result.status).toBe('Unverifiable');
    expect(result.source).toBeNull();
  });

  test('verifyClaims should handle array of claims and return structured annotations', async () => {
    const claims = [
      'Statutory notice period is 14 days under municipal housing code',
      'Pay via Target gift cards to avoid arrest',
      'Individual tenant owes $450 in pet fees'
    ];

    const results = await verifyClaims(claims);
    expect(results).toHaveLength(3);
    expect(results.map(r => r.status)).toContain('Contradicted');
    expect(results.map(r => r.status)).toContain('Verified');
    expect(results.map(r => r.status)).toContain('Unverifiable');
  });
});
