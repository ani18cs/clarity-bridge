const request = require('supertest');
const app = require('../index');

describe('Full REST API Integration Tests', () => {
  let savedSubmissionId = null;

  test('GET /api/health returns 200 OK and health metadata', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('clarity-bridge-backend');
  });

  test('POST /api/analyze executes full pipeline and returns structured data', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .set('x-guest-id', 'test_guest_session_1')
      .send({
        text: 'City Housing Authority Notice: Please resolve past due rent by September 25 or contact housing court ombudsman at (555) 234-5678.',
        language: 'en'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const data = res.body.data;
    expect(data.id).toBeDefined();
    savedSubmissionId = data.id;
    expect(data.summary).toBeDefined();
    expect(data.authenticity).toBeDefined();
    expect(data.authenticity.verdict).toBeDefined();
    expect(data.factChecks).toBeInstanceOf(Array);
    expect(data.actionPlan).toBeDefined();
    expect(data.actionPlan.steps.length).toBeGreaterThan(0);
  });

  test('POST /api/pdf streams generated PDF binary file', async () => {
    const samplePayload = {
      id: 'pdf_test_doc',
      documentType: 'tax_notice',
      summary: 'Property tax assessment notice with payment deadline.',
      authenticity: { verdict: 'Verified' },
      actionPlan: {
        summary: 'Submit payment before deadline.',
        steps: [{ id: 1, title: 'Pay Online', priority: 'High', deadline: '2026-10-01' }]
      }
    };

    const res = await request(app)
      .post('/api/pdf')
      .send(samplePayload);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.body.length).toBeGreaterThan(500);
  });

  test('POST /api/pdf?format=json returns base64 string and file details', async () => {
    const samplePayload = {
      id: 'pdf_json_test',
      summary: 'Summary test',
      actionPlan: { steps: [] }
    };

    const res = await request(app)
      .post('/api/pdf?format=json')
      .send(samplePayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pdfBase64).toBeDefined();
  });

  test('GET /api/history returns list of user submissions', async () => {
    const res = await request(app)
      .get('/api/history')
      .set('x-guest-id', 'test_guest_session_1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('POST /api/speech/synthesize accepts text and returns audio response', async () => {
    const res = await request(app)
      .post('/api/speech/synthesize')
      .send({
        text: 'This is a test readout of the document action plan.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
