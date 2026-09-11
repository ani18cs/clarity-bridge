const { matchAgainstCommunityScams } = require('./communityScam.service');
const logger = require('../middleware/logger');

// Known official government domain patterns
const OFFICIAL_GOV_PATTERNS = [
  /\.gov\.in$/i,
  /\.nic\.in$/i,
  /\.gov$/i,
  /\.gov\.[a-z]{2}$/i,
  /\.mil$/i
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
  /private\s*qr\s*code/i,
  /cash\s*app\s*tag/i
];

// High-pressure threat phrasing
const URGENT_THREAT_PATTERNS = [
  /arrest\s*warrant\s*within/i,
  /police\s*will\s*arrive/i,
  /immediate\s*deportation/i,
  /sheriff\s*is\s*en\s*route/i,
  /do\s*not\s*contact\s*a\s*lawyer/i,
  /confidential\s*matter\s*do\s*not\s*tell/i,
  /assets\s*frozen\s*in\s*(\d+|one|two)\s*hours/i,
  /digital\s*arrest/i,
  /police\s*clearance\s*fee/i
];

// Public free email domains (suspicious if claiming to be ITD, Court, Police, Govt)
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
 * Evaluate document authenticity with Multi-Signal False Positive Protection and India-Specific Routing
 */
async function evaluateAuthenticity({
  extractedFields = {},
  documentType = 'general_letter',
  documentTypeEnum = 'general_document',
  issuingAuthorityClaimed = '',
  rawText = '',
  aiLinguisticSignal = {},
  classificationConfidence = 1.0,
  needsManualReview = false
}) {
  const reasons = [];
  const itemizedSignals = [];
  const firedRedFlags = [];
  const firedSafeSignals = [];

  const authority = (issuingAuthorityClaimed || '').toLowerCase();
  const contactEmail = extractedFields.contactEmail?.value || extractedFields.contactEmail || '';
  const contactWebsite = extractedFields.contactWebsite?.value || extractedFields.contactWebsite || '';
  const payments = (extractedFields.paymentMethodsRequested || []).join(' ');
  const fullContent = `${rawText} ${payments} ${authority} ${extractedFields.keyObligations?.map(o => o.value || o).join(' ') || ''}`;

  // =========================================================================
  // 1. Sender & Official Domain Cross-Check
  // =========================================================================
  const claimsToBeGovernment = /income\s*tax|gst|department\s*of|ministry|police|court|rbi|epfo|uidai|government|irs|sheriff|customs|municipal|water\s*board|electricity\s*board/i.test(authority);

  if (claimsToBeGovernment) {
    if (contactEmail && PUBLIC_EMAIL_DOMAINS.some(p => p.test(contactEmail))) {
      const msg = `Claimed official authority (${issuingAuthorityClaimed}) uses a free public email (${contactEmail}) instead of an official government domain (.gov.in).`;
      reasons.push(msg);
      firedRedFlags.push('suspicious_public_email');
      itemizedSignals.push({
        id: 'domain_sender_check',
        name: 'Sender & Domain Verification',
        icon: 'shield-alert',
        direction: 'indicates_suspicion',
        severity: 'danger',
        tag: '🚨 Public Email Address Used',
        explanation: msg
      });
    } else if (contactWebsite && !OFFICIAL_GOV_PATTERNS.some(p => p.test(contactWebsite)) && !/localhost|127\.0\.0\.1/i.test(contactWebsite)) {
      if (/\.info$|\.xyz$|\.top$|\.online$|\.site$|\.net$/i.test(contactWebsite)) {
        const msg = `Website listed (${contactWebsite}) uses an unverified commercial domain extension rather than an official .gov.in domain.`;
        reasons.push(msg);
        firedRedFlags.push('suspicious_domain_tld');
        itemizedSignals.push({
          id: 'domain_sender_check',
          name: 'Sender & Domain Verification',
          icon: 'shield-alert',
          direction: 'indicates_suspicion',
          severity: 'danger',
          tag: '🚨 Suspicious Domain TLD',
          explanation: msg
        });
      } else {
        const msg = `Website listed (${contactWebsite}) does not end in an official government domain (.gov.in).`;
        reasons.push(msg);
        firedRedFlags.push('non_gov_domain');
        itemizedSignals.push({
          id: 'domain_sender_check',
          name: 'Sender & Domain Verification',
          icon: 'shield-alert',
          direction: 'indicates_suspicion',
          severity: 'caution',
          tag: '⚠️ Non-Gov Domain',
          explanation: msg
        });
      }
    } else if ((contactWebsite && OFFICIAL_GOV_PATTERNS.some(p => p.test(contactWebsite))) || (contactEmail && OFFICIAL_GOV_PATTERNS.some(p => p.test(contactEmail)))) {
      const msg = 'Claimed issuing authority and domain match recognized official government domain standards (.gov / .gov.in).';
      reasons.push(msg);
      firedSafeSignals.push('verified_domain');
      itemizedSignals.push({
        id: 'domain_sender_check',
        name: 'Sender & Domain Verification',
        icon: 'shield-check',
        direction: 'supports_authenticity',
        severity: 'safe',
        tag: '✔ Verified Official Domain',
        explanation: msg
      });
    } else {
      const msg = 'Government authority claimed; no verifiable official domain found in contact details.';
      reasons.push(msg);
      itemizedSignals.push({
        id: 'domain_sender_check',
        name: 'Sender & Domain Verification',
        icon: 'shield',
        direction: 'neutral',
        severity: 'safe',
        tag: 'ℹ️ Unverified Contact Details',
        explanation: msg
      });
    }
  } else {
    const msg = `Document originates from an institutional or private entity (${issuingAuthorityClaimed || 'Private Entity'}).`;
    reasons.push(msg);
    itemizedSignals.push({
      id: 'domain_sender_check',
      name: 'Sender & Domain Verification',
      icon: 'shield',
      direction: 'neutral',
      severity: 'safe',
      tag: 'ℹ️ Non-Government Entity',
      explanation: msg
    });
  }

  // =========================================================================
  // 2. India-Specific Statutory Verification (DIN, GSTIN, RBI Sachet)
  // =========================================================================
  const isIncomeTaxClaim = /income\s*tax|\bitd\b|section\s*143|section\s*156/i.test(authority) || documentTypeEnum === 'income_tax_notice';
  const dinValue = extractedFields.din?.value || null;

  if (isIncomeTaxClaim) {
    // ITD Circular No. 19/2019: Every notice post 1-Oct-2019 must have a 20-digit DIN
    if (dinValue && /^\d{20}$/.test(dinValue)) {
      const msg = `Valid 20-digit Document Identification Number (DIN: ${dinValue}) present. Verify online at incometax.gov.in.`;
      reasons.push(msg);
      firedSafeSignals.push('valid_itd_din');
      itemizedSignals.push({
        id: 'india_din_check',
        name: 'Income Tax DIN Verification',
        icon: 'check-circle',
        direction: 'supports_authenticity',
        severity: 'safe',
        tag: '✔ 20-Digit DIN Present',
        explanation: msg,
        verificationUrl: 'https://www.incometax.gov.in/iec/foportal/help/authenticate-notice-faq'
      });
    } else {
      // Missing DIN on Income Tax communication -> Major Red Flag under Circular 19/2019
      const msg = 'CRITICAL RED FLAG: Income Tax communication lacks a 20-digit Document Identification Number (DIN). Under ITD Circular 19/2019, any notice without a DIN is invalid and deemed non-existent.';
      reasons.push(msg);
      firedRedFlags.push('missing_itd_din');
      itemizedSignals.push({
        id: 'india_din_check',
        name: 'Income Tax DIN Verification',
        icon: 'alert-octagon',
        direction: 'indicates_suspicion',
        severity: 'danger',
        tag: '🚨 Missing 20-Digit DIN (Circular 19/2019)',
        explanation: msg,
        verificationUrl: 'https://www.incometax.gov.in/iec/foportal/help/authenticate-notice-faq'
      });
    }
  }

  // Bank / NBFC Digital Lending Verification
  const isLendingNotice = /loan|nbfc|recovery|emi|overdue|digital\s*lending/i.test(authority) || documentTypeEnum === 'banking_loan_notice';
  if (isLendingNotice) {
    if (/advance\s*fee|processing\s*fee\s*before\s*disbursal|share\s*contacts\s*gallery/i.test(fullContent)) {
      const msg = 'RED FLAG: Demands advance fee or access to phone contacts/gallery. Prohibited under RBI Digital Lending Guidelines.';
      reasons.push(msg);
      firedRedFlags.push('rbi_digital_lending_violation');
      itemizedSignals.push({
        id: 'rbi_lending_check',
        name: 'RBI Lending Guidelines Check',
        icon: 'alert-triangle',
        direction: 'indicates_suspicion',
        severity: 'danger',
        tag: '🚨 RBI Lending Violation',
        explanation: msg,
        verificationUrl: 'https://sachet.rbi.org.in'
      });
    } else {
      itemizedSignals.push({
        id: 'rbi_lending_check',
        name: 'RBI Lending Verification',
        icon: 'shield',
        direction: 'supports_authenticity',
        severity: 'safe',
        tag: 'ℹ️ Check RBI Sachet Portal',
        explanation: 'Confirm lending entity registration on the RBI Sachet portal.',
        verificationUrl: 'https://sachet.rbi.org.in'
      });
    }
  }

  // =========================================================================
  // 3. Payment Method & Coercion Scanner
  // =========================================================================
  const detectedScamPayments = SCAM_PAYMENT_KEYWORDS.filter(p => p.test(fullContent));
  const detectedThreats = URGENT_THREAT_PATTERNS.filter(p => p.test(fullContent));

  if (detectedScamPayments.length > 0) {
    const msg = 'RED FLAG: Demands payment via gift cards, cryptocurrency, or peer-to-peer tags. Official authorities NEVER accept these channels.';
    reasons.push(msg);
    firedRedFlags.push('scam_payment_demand');
    itemizedSignals.push({
      id: 'scam_payment_scan',
      name: 'Payment Method Authenticity',
      icon: 'alert-triangle',
      direction: 'indicates_suspicion',
      severity: 'danger',
      tag: '🚨 Irregular Payment Demanded',
      explanation: msg
    });
  } else {
    firedSafeSignals.push('normal_payments');
    itemizedSignals.push({
      id: 'scam_payment_scan',
      name: 'Payment Method Authenticity',
      icon: 'check-circle',
      direction: 'supports_authenticity',
      severity: 'safe',
      tag: '✔ Standard Banking Channels',
      explanation: 'No irregular payment channels (gift cards, crypto, peer-to-peer tags) detected.'
    });
  }

  if (detectedThreats.length > 0) {
    const msg = 'RED FLAG: Contains aggressive high-pressure threats of immediate arrest or asset freezing designed to trigger panic.';
    reasons.push(msg);
    firedRedFlags.push('coercive_threats');
    itemizedSignals.push({
      id: 'coercion_threat_scan',
      name: 'Coercion & Urgency Language Scan',
      icon: 'alert-octagon',
      direction: 'indicates_suspicion',
      severity: 'danger',
      tag: '🚨 Coercive Urgency Phrasing',
      explanation: msg
    });
  } else {
    firedSafeSignals.push('administrative_tone');
    itemizedSignals.push({
      id: 'coercion_threat_scan',
      name: 'Coercion & Urgency Language Scan',
      icon: 'check-circle',
      direction: 'supports_authenticity',
      severity: 'safe',
      tag: '✔ Administrative Tone',
      explanation: 'Tone complies with standard institutional administrative communication.'
    });
  }

  // =========================================================================
  // 4. Timeline & Date Consistency
  // =========================================================================
  const noticeDateStr = extractedFields.noticeDate?.value || extractedFields.noticeDate;
  const dueDateStr = extractedFields.dueDate?.value || extractedFields.dueDate;

  if (noticeDateStr && dueDateStr) {
    try {
      const parseDate = (d) => {
        const parts = d.split(/[-/.]/);
        if (parts.length === 3) {
          // Check DD/MM/YYYY vs YYYY/MM/DD
          if (parts[2].length === 4) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          return new Date(d);
        }
        return new Date(d);
      };
      const nDate = parseDate(noticeDateStr);
      const dDate = parseDate(dueDateStr);
      if (!isNaN(nDate.getTime()) && !isNaN(dDate.getTime()) && dDate < nDate) {
        const msg = `Inconsistent dates: The deadline (${dueDateStr}) occurs before the notice issue date (${noticeDateStr}).`;
        reasons.push(msg);
        firedRedFlags.push('inconsistent_timeline');
        itemizedSignals.push({
          id: 'timeline_consistency',
          name: 'Timeline & Logic Consistency',
          icon: 'calendar-x',
          direction: 'indicates_suspicion',
          severity: 'danger',
          tag: '⚠️ Timeline Conflict',
          explanation: msg
        });
      } else {
        firedSafeSignals.push('logical_timeline');
        itemizedSignals.push({
          id: 'timeline_consistency',
          name: 'Timeline & Logic Consistency',
          icon: 'calendar-check',
          direction: 'supports_authenticity',
          severity: 'safe',
          tag: '✔ Logical Timeline',
          explanation: 'Notice issue date and deadline timeline are logically consistent.'
        });
      }
    } catch (e) {}
  }

  // =========================================================================
  // 5. Community Scam-Pattern Pool Match
  // =========================================================================
  try {
    const communityCheck = await matchAgainstCommunityScams({
      issuingAuthorityClaimed,
      rawText,
      paymentMethods: extractedFields.paymentMethodsRequested || []
    });

    if (communityCheck.matched && communityCheck.matchCount > 0) {
      const msg = `Matches ${communityCheck.matchCount} previously reported fraud pattern(s) in the shared Community Scam Database.`;
      reasons.push(msg);
      firedRedFlags.push('community_scam_match');
      itemizedSignals.push({
        id: 'community_pool_match',
        name: 'Community Scam Pattern Pool',
        icon: 'users',
        direction: 'indicates_suspicion',
        severity: 'danger',
        tag: `🚨 Matched ${communityCheck.matchCount} Community Report(s)`,
        explanation: msg
      });
    } else {
      firedSafeSignals.push('no_community_scams');
      itemizedSignals.push({
        id: 'community_pool_match',
        name: 'Community Scam Pattern Pool',
        icon: 'users',
        direction: 'supports_authenticity',
        severity: 'safe',
        tag: '✔ No Community Scam Matches',
        explanation: 'No matching signatures found in the community fraud pattern pool.'
      });
    }
  } catch (commErr) {}

  // =========================================================================
  // Multi-Signal False Positive Protection & 4-Tier Verdict Calculation
  // =========================================================================
  let verdict = 'Verified';
  let confidence = 0.90;

  const redFlagCount = firedRedFlags.length;
  const safeSignalCount = firedSafeSignals.length;
  const hasStrongAuthSignal = firedSafeSignals.includes('verified_domain') || firedSafeSignals.includes('valid_itd_din');

  // Rule 1: Needs Manual Review if extraction/classification confidence is low OR strong positive and negative signals conflict
  if (needsManualReview || classificationConfidence < 0.65 || (hasStrongAuthSignal && redFlagCount >= 1)) {
    verdict = 'Needs Manual Review';
    confidence = 0.65;
    reasons.unshift('Uncertain or conflicting signals detected — manual review recommended.');
  }
  // Rule 2: Likely Fraudulent strictly requires AT LEAST TWO INDEPENDENT RED FLAGS
  else if (redFlagCount >= 2) {
    verdict = 'Likely Fraudulent';
    confidence = Math.min(0.98, 0.70 + (redFlagCount * 0.08));
  }
  // Rule 3: Single Red Flag yields Use Caution (False Positive Protection)
  else if (redFlagCount === 1) {
    verdict = 'Use Caution';
    confidence = 0.75;
  }
  // Rule 4: Zero Red Flags yields Verified
  else {
    verdict = 'Verified';
    confidence = 0.92;
  }

  // Diagnostic internal log of signal combinations
  logger.info('Authenticity Signal Combination Diagnostic', {
    verdict,
    confidence,
    redFlags: firedRedFlags,
    safeSignals: firedSafeSignals,
    redFlagCount,
    documentTypeEnum
  });

  return {
    verdict,
    confidence: Number(confidence.toFixed(2)),
    redFlagsCount: redFlagCount,
    reasons,
    itemizedSignals,
    firedRedFlags,
    firedSafeSignals
  };
}

module.exports = {
  evaluateAuthenticity,
  OFFICIAL_GOV_PATTERNS,
  SCAM_PAYMENT_KEYWORDS,
  URGENT_THREAT_PATTERNS
};
