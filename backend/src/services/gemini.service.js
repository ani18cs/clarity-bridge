const { GoogleGenerativeAI } = require('@google/generative-ai');
const { config } = require('../config/env');
const { safeJsonParse } = require('../utils/sanitize');
const logger = require('../middleware/logger');

let genAI = null;
if (config.geminiApiKey) {
  try {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
  } catch (err) {
    logger.warn('Failed to initialize GoogleGenerativeAI instance', { error: err.message });
  }
}

/**
 * Analyze document (multimodal or text) using Gemini
 * Extracts: documentType, issuingAuthorityClaimed, structuredFields, summary, actionPlan, claimsToCheck
 */
async function analyzeDocument({ fileBuffer, mimeType, textContent, language = 'en' }) {
  const startTime = Date.now();
  logger.pipelineStage('Gemini_Multimodal_Analysis_Start', {
    hasFile: !!fileBuffer,
    mimeType: mimeType || 'text/plain',
    targetLanguage: language
  });

  // If no API key is configured (e.g. unit testing or demo without credentials), use mock generator
  if (!config.geminiApiKey && !genAI) {
    logger.warn('GEMINI_API_KEY not configured — returning mock analysis response');
    return generateMockAnalysis({ textContent, language });
  }

  const modelName = config.geminiModel || 'gemini-2.5-flash';
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json'
    }
  });

  const prompt = `
You are ClarityBridge, an expert, compassionate AI assistant that analyzes official documents, notices, bills, letters, and suspected scam messages to help everyday citizens understand them and take action.

Target Output Language: ${language} (Translate summary, action plan, and explanations into this language).

Analyze the provided document/text thoroughly and respond ONLY with a valid JSON object matching this schema:
{
  "documentType": "string (e.g., eviction_notice, tax_bill, benefit_denial, court_summons, utility_shutoff, debt_collection, medical_bill, suspicious_solicitation, general_letter)",
  "issuingAuthorityClaimed": "string (e.g., City Department of Revenue, IRS, Landlord, Unknown)",
  "extractedFields": {
    "noticeDate": "string or null (ISO YYYY-MM-DD or readable)",
    "dueDate": "string or null",
    "amountDue": "string or null (e.g., '$450.00')",
    "caseOrReferenceNumber": "string or null",
    "recipientName": "string or null",
    "recipientAddress": "string or null",
    "contactPhone": "string or null",
    "contactEmail": "string or null",
    "contactWebsite": "string or null",
    "paymentMethodsRequested": ["string"],
    "keyObligations": ["string"]
  },
  "summary": "Clear, compassionate 2-4 sentence plain-language summary at a 6th-grade reading level explaining what this is, why it matters, and the core stakes.",
  "actionPlan": {
    "summary": "One-line priority directive for the user.",
    "steps": [
      {
        "id": 1,
        "title": "Short title of step",
        "description": "Specific, practical instruction on what to do.",
        "priority": "Urgent | High | Medium | Low",
        "deadline": "YYYY-MM-DD or relative timeframe",
        "contact": "Phone or department to reach out to"
      }
    ],
    "contacts": [
      {
        "name": "Authority / Helpline Name",
        "phone": "Phone number or null",
        "email": "Email or null",
        "website": "Website or null",
        "address": "Physical address or null"
      }
    ]
  },
  "claimsToCheck": [
    "Specific checkable factual claim 1 (e.g., 'City Housing Ordinance § 4-12 grants 14 days before filing')",
    "Specific checkable factual claim 2 (e.g., 'Office located at 500 Civic Center Blvd')"
  ],
  "aiLinguisticSignal": {
    "score": 0.0 to 1.0 (estimated likelihood of synthetic/scam boilerplate phrasing),
    "reason": "Short explanation of linguistic patterns observed"
  }
}
`;

  try {
    const parts = [];

    if (fileBuffer) {
      parts.push({
        inlineData: {
          data: fileBuffer.toString('base64'),
          mimeType: mimeType || 'image/jpeg'
        }
      });
    }

    if (textContent) {
      parts.push({ text: `User provided context / transcript / text:\n${textContent}` });
    }

    parts.push({ text: prompt });

    const result = await model.generateContent(parts);
    const responseText = result.response.text();
    const parsed = safeJsonParse(responseText, null);

    if (!parsed) {
      throw new Error('Failed to parse structured JSON from Gemini response');
    }

    logger.pipelineStage('Gemini_Multimodal_Analysis_Complete', {
      durationMs: Date.now() - startTime,
      documentType: parsed.documentType,
      issuingAuthority: parsed.issuingAuthorityClaimed
    });

    return parsed;
  } catch (err) {
    logger.error('Gemini API Error', { error: err.message });
    // Fallback to mock if API fails
    return generateMockAnalysis({ textContent, language, error: err.message });
  }
}

/**
 * Generate a realistic fallback response for local development / testing
 */
function generateMockAnalysis({ textContent = '', language = 'en', error = null }) {
  const isScam = /gift card|crypto|bitcoin|wire transfer|arrest|urgent warrant|whatsapp/i.test(textContent);

  if (isScam) {
    return {
      documentType: 'suspicious_solicitation',
      issuingAuthorityClaimed: 'Urgent Processing Center / Imposter Authority',
      extractedFields: {
        noticeDate: '2026-09-10',
        dueDate: 'Immediate',
        amountDue: '$950.00',
        caseOrReferenceNumber: 'CASE-9921-SCAM',
        recipientName: 'Valued Resident',
        recipientAddress: null,
        contactPhone: '+1-800-555-0199',
        contactEmail: 'support@urgent-gov-clearance.net',
        contactWebsite: 'http://urgent-verify-payment.info',
        paymentMethodsRequested: ['Apple Gift Cards', 'Bitcoin'],
        keyObligations: ['Pay immediately within 24 hours to avoid arrest']
      },
      summary: 'This message claims you owe an urgent fee and threatens penalties if not paid immediately via gift cards. Official government agencies never demand payment via gift cards or cryptocurrency.',
      actionPlan: {
        summary: 'Do not pay or provide personal information. This message contains classic fraud red flags.',
        steps: [
          {
            id: 1,
            title: 'Do NOT Send Money or Gift Cards',
            description: 'Cease all communication with the sender. Legitimate authorities never demand payment in gift cards or crypto.',
            priority: 'Urgent',
            deadline: 'Immediate',
            contact: 'Federal Trade Commission (FTC) Fraud Hotline'
          },
          {
            id: 2,
            title: 'Report the Fraud Attempt',
            description: 'File a report with your local police and the national fraud reporting agency (e.g. reportfraud.ftc.gov).',
            priority: 'High',
            deadline: 'Within 48 hours',
            contact: 'reportfraud.ftc.gov'
          }
        ],
        contacts: [
          {
            name: 'FTC Consumer Protection Hotline',
            phone: '1-877-382-4357',
            email: null,
            website: 'https://reportfraud.ftc.gov',
            address: 'Washington, DC'
          }
        ]
      },
      claimsToCheck: [
        'Payment via gift cards is required to settle municipal liabilities.',
        'Warrant issued without prior court summons.'
      ],
      aiLinguisticSignal: {
        score: 0.85,
        reason: 'High density of high-pressure urgency keywords and generic impersonal salutation.'
      }
    };
  }

  return {
    documentType: 'eviction_notice',
    issuingAuthorityClaimed: 'Metro Housing Management & Court Clerk',
    extractedFields: {
      noticeDate: '2026-09-08',
      dueDate: '2026-09-22',
      amountDue: '$1,200.00',
      caseOrReferenceNumber: 'EV-2026-8819',
      recipientName: 'Jane Doe',
      recipientAddress: '742 Evergreen Terrace, Apt 4B',
      contactPhone: '(555) 234-5678',
      contactEmail: 'clerk@metro-housing.gov',
      contactWebsite: 'https://metrohousing.gov',
      paymentMethodsRequested: ['Certified Check', 'Online Tenant Portal'],
      keyObligations: ['Cure past-due rent balance or file an official response within 14 calendar days']
    },
    summary: 'This is an official 14-day notice to cure past-due rent of $1,200 or attend a housing mediation hearing. You have until September 22, 2026 to resolve this balance or submit an emergency tenant assistance application.',
    actionPlan: {
      summary: 'Take immediate action within the 14-day window to protect your tenancy rights.',
      steps: [
        {
          id: 1,
          title: 'Apply for Emergency Rental Assistance',
          description: 'Submit an expedited application to the Municipal Tenant Relief Fund to stay any court proceedings.',
          priority: 'Urgent',
          deadline: '2026-09-15',
          contact: 'Metro Housing Relief Line: (555) 234-5678'
        },
        {
          id: 2,
          title: 'Contact Legal Aid / Housing Ombudsman',
          description: 'Consult free tenant legal aid for representation and guidance on filing an answer.',
          priority: 'High',
          deadline: '2026-09-18',
          contact: 'Tenant Legal Advocacy Clinic: (555) 890-1234'
        },
        {
          id: 3,
          title: 'Request Written Payment Arrangement',
          description: 'Document all communications with your landlord in writing and keep proof of all payments.',
          priority: 'Medium',
          deadline: '2026-09-21',
          contact: 'Property Management Office'
        }
      ],
      contacts: [
        {
          name: 'Metro Housing Court Clerk',
          phone: '(555) 234-5678',
          email: 'clerk@metro-housing.gov',
          website: 'https://metrohousing.gov',
          address: '100 Civic Center Square, Room 204'
        },
        {
          name: 'Free Tenant Advocacy Legal Clinic',
          phone: '(555) 890-1234',
          email: 'help@tenantlegal.org',
          website: 'https://tenantlegal.org',
          address: '45 Community Way'
        }
      ]
    },
    claimsToCheck: [
      'Tenant has a statutory right to 14-day cure period under State Housing Code § 504.',
      'Metro Housing Court Clerk is located at 100 Civic Center Square.'
    ],
    aiLinguisticSignal: {
      score: 0.12,
      reason: 'Contains standard municipal statutory citations and formal court formatting.'
    }
  };
}

module.exports = {
  analyzeDocument,
  generateMockAnalysis
};
