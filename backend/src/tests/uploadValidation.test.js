const request = require('supertest');
const app = require('../index');

describe('Upload and Input Validation Tests', () => {
  test('POST /api/analyze should return 400 when no input (file, audio, or text) is provided', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('ValidationError');
  });

  test('POST /api/analyze should accept valid plain text input', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        text: 'This is a test eviction notice demanding $1200 rent by next Tuesday.',
        language: 'en'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.summary).toBeDefined();
    expect(res.body.data.actionPlan).toBeDefined();
  });

  test('POST /api/analyze should accept simulated image file upload', async () => {
    const dummyImageBuffer = Buffer.from('fake-image-bytes-header-png');
    const res = await request(app)
      .post('/api/analyze')
      .attach('file', dummyImageBuffer, 'notice.png')
      .field('text', 'Notice received today');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.inputType).toBe('image');
  });

  test('POST /api/speech/synthesize should return 400 when text is missing', async () => {
    const res = await request(app)
      .post('/api/speech/synthesize')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
