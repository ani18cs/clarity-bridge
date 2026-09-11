const { verifySingleClaim, verifyClaims } = require('../services/factcheck.service');

describe('Honest Fact-Checking & Anti-Fabrication Tests', () => {
  test('Claims with no corroborating search results must strictly return Unverifiable, never Verified', async () => {
    const uncorroboratedClaim = 'The special committee met on an unrecorded date in a private room with no public minutes.';
    const result = await verifySingleClaim(uncorroboratedClaim);

    expect(result.status).toBe('Unverifiable');
    expect(result.status).not.toBe('Verified');
    expect(result.source).toBeNull();
  });

  test('Verified claim must strictly include an authentic source citation', async () => {
    const statutoryClaim = 'Section 138 of the Negotiable Instruments Act provides 15 days to make payment upon receipt of notice.';
    const result = await verifySingleClaim(statutoryClaim);

    if (result.status === 'Verified') {
      expect(result.source).toBeDefined();
      expect(result.source).not.toBeNull();
      expect(result.source.length).toBeGreaterThan(0);
    }
  });

  test('Batch verifyClaims auto-downgrades any claim missing a valid source to Unverifiable', async () => {
    const claims = [
      'Statutory interest rate is regulated by RBI guidelines',
      'The sender claims they had lunch at 1 PM yesterday',
      'Arrest warrants can be cancelled by purchasing Apple Gift Cards'
    ];

    const results = await verifyClaims(claims);

    for (const r of results) {
      if (r.status === 'Verified' || r.status === 'Contradicted') {
        expect(r.source).toBeDefined();
      } else {
        expect(r.status).toBe('Unverifiable');
      }
    }
  });
});
