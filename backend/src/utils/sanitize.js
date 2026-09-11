/**
 * Sanitization and string manipulation utilities
 */

function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str.trim();
}

function safeJsonParse(jsonString, fallback = {}) {
  if (!jsonString) return fallback;
  try {
    // If the LLM returned markdown backticks ```json ... ```, strip them
    let cleaned = jsonString.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return JSON.parse(cleaned);
  } catch (err) {
    // Attempt basic regex fix for trailing commas or malformed JSON
    try {
      const match = jsonString.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch (inner) {}
    return fallback;
  }
}

function truncateString(str, maxLength = 100) {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

module.exports = {
  sanitizeText,
  safeJsonParse,
  truncateString
};
