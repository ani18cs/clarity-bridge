const request = require('supertest');
const app = require('../index');
const { localScamPatternStore } = require('../services/communityScam.service');

describe('Share Route & Community Scam API Tests', () => {
  const sampleAnalysis = {
    id: 'sub_test_123',
    documentType: 'court_summons',
    issuingAuthorityClaimed: 'Municipal Court of Delhi',
    documentPurpose: 'Formal judicial hearing notice.',
    summary: 'A notice to appear in court on October 15.',
    extractedFields: {
      noticeDate: '2026-10-01',
      dueDate: '2026-10-15',
      caseOrReferenceNumber: 'CR-9874'
    },
    actionPlan: {
      summary: 'Prepare formal response.',
      steps: [{ id: 1, title: 'Consult Legal Aid', priority: 'Urgent' }]
    },
    authenticity: {
      verdict: 'Verified',
      confidence: 0.95,
      reasons: ['Valid institutional format']
    },
    factChecks: []
  };

  test('POST /api/share should create a scoped, unguessable share link with 7-day expiry', async () => {
    const res = await request(app)
      .post('/api/share')
      .send(sampleAnalysis);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.shareId).toMatch(/^CB-[a-f0-9]{16}$/);
    expect(res.body.data.shareUrl).toContain(res.body.data.shareId);
    expect(res.body.data.expiresAt).toBeDefined();

    const expiry = new Date(res.body.data.expiresAt);
    const now = new Date();
    const diffDays = (expiry - now) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThan(6.9);
    expect(diffDays).toBeLessThan(7.1);
  });

  test('GET /api/share/:shareId should allow public, unauthenticated read-only access with disclaimer', async () => {
    // 1. Create a share link
    const createRes = await request(app)
      .post('/api/share')
      .send(sampleAnalysis);
    const { shareId } = createRes.body.data;

    // 2. Fetch without any auth token
    const fetchRes = await request(app)
      .get(`/api/share/${shareId}`);

    expect(fetchRes.status).toBe(200);
    expect(fetchRes.body.success).toBe(true);
    expect(fetchRes.body.data.shareId).toBe(shareId);
    expect(fetchRes.body.data.summary).toBe(sampleAnalysis.summary);
    expect(fetchRes.body.data.disclaimer).toContain('ClarityBridge');
    expect(fetchRes.body.data.disclaimer).toContain('not a lawyer or government agency');

    // Security check: must NOT expose internal user IDs or raw file storage paths
    expect(fetchRes.body.data.userId).toBeUndefined();
    expect(fetchRes.body.data.rawStoragePath).toBeUndefined();
  });

  test('GET /api/share/invalid_id should return 404 without leaking other submissions', async () => {
    const res = await request(app)
      .get('/api/share/CB-nonexistent999');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('NotFound');
  });

  test('POST /api/community-scam/report should accept and scrub fraud patterns into shared pool', async () => {
    const scamSubmission = {
      documentType: 'suspicious_solicitation',
      issuingAuthorityClaimed: 'Fake Electricity Department from +91 9988776655',
      threatPhrases: [
        'Power will be cut at 9:30 PM for PAN ABCDE5678G',
        'Send Rs 2500 to account 9876543210123'
      ],
      paymentMethodsRequested: ['Unauthorized APK Link'],
      summary: 'Threatening disconnection notice sent to user@fraudulent.in.'
    };

    const res = await request(app)
      .post('/api/community-scam/report')
      .send(scamSubmission);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.patternId).toBeDefined();

    // Verify pattern stored in community database has PII stripped
    const stored = localScamPatternStore.find(p => p.id === res.body.data.patternId);
    expect(stored).toBeDefined();
    expect(stored.issuingAuthorityClaimed).toContain('[REDACTED_PHONE]');
    expect(stored.threatPhrases[0]).toContain('[REDACTED_PAN]');
    expect(stored.threatPhrases[1]).toContain('[REDACTED_ACCOUNT]');
    expect(stored.scrubbedSummary).toContain('[REDACTED_EMAIL]');
  });

  test('GET /api/community-scam/stats should return aggregate count of community fraud patterns', async () => {
    const res = await request(app)
      .get('/api/community-scam/stats');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.totalPatternsTracked).toBe('number');
    expect(res.body.totalPatternsTracked).toBeGreaterThan(0);
  });
});
