const { synthesizeSpeech, transcribeAudio } = require('../services/speech.service');

describe('Speech Service Tests', () => {
  test('synthesizeSpeech should return structured object with browser fallback or audio content', async () => {
    const result = await synthesizeSpeech('This is a test summary for read-aloud functionality.');

    expect(result).toBeDefined();
    expect(result).toHaveProperty('useBrowserFallback');
  });

  test('transcribeAudio should handle empty buffer gracefully', async () => {
    const transcript = await transcribeAudio(null);

    expect(typeof transcript).toBe('string');
    expect(transcript.length).toBeGreaterThan(0);
  });
});
