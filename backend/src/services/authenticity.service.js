const logger = require('../middleware/logger');

// Known official domain patterns and authorities
const OFFICIAL_GOV_PATTERNS = [
  /\.gov$/i,
  /\.gov\.[a-z]{2}$/i,
  /\.mil$/i,
  /\.gov\.in$/i,
  /\.gov\.uk$/i,
  /\.ca\.gov$/i,
  /\.state\.[a-z]{2}\.us$/i
];

// High-risk scam payment methods
const SCAM_PAYMENT_KEYWORDS = [
  /gift\s*card/i,
  /apple\s*card/i,
  /google\s*play/i,
  /target\s*card/i,
  /bitcoin/i,
  /crypto/i,
  /ethereum/i,
  /usdt/i,
  /western\s*union/i,
  /moneygram/i,
  /wire\s*transfer\s*immediately/i,
  /cash\s*app\s*tag/i,
  /venmo\s*to/i,
  /zelle\s*to/i
];

// High-pressure threat phrasing
const URGENT_THREAT_PATTERNS = [
  /arrest\s*warrant\s*within/i,
  /police\s*will\s*arrive/i,
  /immediate\s*deportation/i,
  /sheriff\s*is\s*en\s*route/i,
  /do\s*not\s*contact\s*a\s*lawyer/i,
  /confidential\s*matter\s*do\s*not\s*tell/i,
  /assets\s*frozen\s*in\s*(\d+|one|two)\s*hours/i
];

// Public free email domains (suspicious if claiming to be IRS, Court, Govt)
const PUBLIC_EMAIL_DOMAINS = [
  /@gmail\.com/i,
  /@yahoo\.com/i,
  /@hotmail\.com/i,
  /@outlook\.com/i,
  /@aol\.com/i,
  /@protonmail\.com/i,
  /@mail\.com/i
];

/**
 * Evaluate document authenticity and calculate risk verdict with specific reasons
 */
function evaluateAuthenticity({
  extractedFields = {},
  documentType = 'general_letter',
  issuingAuthorityClaimed = '',
  rawText = '',
  aiLinguisticSignal = {}
}) {
  const reasons = [];
  let riskScore = 0; // 0 (safest) to 100 (highest risk)

  const authority = (issuingAuthorityClaimed || '').toLowerCase();
  const contactEmail = extractedFields.contactEmail || '';
  const contactWebsite = extractedFields.contactWebsite || '';
  const payments = (extractedFields.paymentMethodsRequested || []).join(' ');
  const fullContent = `${rawText} ${payments} ${authority} ${extractedFields.keyObligations?.join(' ') || ''}`;

  // =========================================================================
  // 1. Sender & Domain Cross-Check
  // =========================================================================
  const claimsToBeGovernment = /irs|internal revenue|court|sheriff|police|department of|ministry|federal|treasury|social security|medicare/i.test(authority);

  if (claimsToBeGovernment) {
    if (contactEmail && PUBLIC_EMAIL_DOMAINS.some(p => p.test(contactEmail))) {
      riskScore += 45;
      reasons.push(`Claimed government entity (${issuingAuthorityClaimed}) uses a free public email address (${contactEmail}) instead of an official .gov domain.`);
    } else if (contactWebsite && !OFFICIAL_GOV_PATTERNS.some(p => p.test(contactWebsite)) && !/localhost|127\.0\.0\.1/i.test(contactWebsite)) {
      if (/\.info$|\.xyz$|\.top$|\.online$|\.site$/i.test(contactWebsite)) {
        riskScore += 40;
        reasons.push(`Website listed (${contactWebsite}) uses a high-risk generic domain extension rather than a verified institutional domain.`);
      } else {
        riskScore += 15;
        reasons.push(`Website listed (${contactWebsite}) does not end in a standard official government TLD (.gov).`);
      }
    } else {
      reasons.push('Claimed issuing authority formatting aligns with recognized institutional patterns.');
    }
  } else {
    reasons.push(`Document originates from a private or corporate entity (${issuingAuthorityClaimed || 'Private Party'}).`);
  }

  // =========================================================================
  // 2. Scam-Pattern Heuristic Scanner
  // =========================================================================
  const detectedScamPayments = SCAM_PAYMENT_KEYWORDS.filter(pattern => pattern.test(fullContent));
  if (detectedScamPayments.length > 0) {
    riskScore += 50;
    reasons.push('RED FLAG: Requests payment via gift cards, cryptocurrency, or peer-to-peer apps. Legitimate authorities NEVER accept these payment methods.');
  }

  const detectedThreats = URGENT_THREAT_PATTERNS.filter(pattern => pattern.test(fullContent));
  if (detectedThreats.length > 0) {
    riskScore += 35;
    reasons.push('RED FLAG: Contains aggressive high-pressure threats of immediate arrest or asset seizure designed to trigger panic.');
  }

  if (/dear\s*(citizen|customer|resident|sir\/madam|friend)/i.test(fullContent) && claimsToBeGovernment) {
    riskScore += 10;
    reasons.push('Uses generic impersonal greeting on a supposedly critical personalized official notification.');
  }

  // =========================================================================
  // 3. Internal Timeline & Logic Consistency Check
  // =========================================================================
  if (extractedFields.noticeDate && extractedFields.dueDate) {
    try {
      const notice = new Date(extractedFields.noticeDate);
      const due = new Date(extractedFields.dueDate);
      if (!isNaN(notice.getTime()) && !isNaN(due.getTime()) && due < notice) {
        riskScore += 30;
        reasons.push(`Inconsistent dates: The deadline (${extractedFields.dueDate}) occurs before the notice issue date (${extractedFields.noticeDate}).`);
      } else {
        reasons.push('Notice issue date and deadline timeline are logically consistent.');
      }
    } catch (e) {}
  }

  // =========================================================================
  // 4. AI-Generated Phishing / Template Linguistic Signal
  // =========================================================================
  if (aiLinguisticSignal && typeof aiLinguisticSignal.score === 'number') {
    if (aiLinguisticSignal.score > 0.7) {
      riskScore += 20;
      reasons.push(`Linguistic analysis indicates elevated markers of synthetic/scam template wording (${aiLinguisticSignal.reason || 'Generic repetitive phrasing'}).`);
    }
  }

  // =========================================================================
  // Final Verdict Assembly
  // =========================================================================
  let verdict = 'Verified';
  let confidence = 0.90;

  if (riskScore >= 60) {
    verdict = 'Likely Fraudulent';
    confidence = Math.min(0.98, 0.65 + (riskScore / 200));
  } else if (riskScore >= 25) {
    verdict = 'Use Caution';
    confidence = Math.min(0.85, 0.50 + (riskScore / 200));
  } else {
    verdict = 'Verified';
    confidence = Math.max(0.75, 0.95 - (riskScore / 100));
  }

  logger.pipelineStage('Authenticity_Evaluation_Complete', {
    verdict,
    confidence,
    riskScore,
    reasonsCount: reasons.length
  });

  return {
    verdict,
    confidence: Number(confidence.toFixed(2)),
    riskScore,
    reasons
  };
}

module.exports = {
  evaluateAuthenticity,
  OFFICIAL_GOV_PATTERNS,
  SCAM_PAYMENT_KEYWORDS,
  URGENT_THREAT_PATTERNS
};
