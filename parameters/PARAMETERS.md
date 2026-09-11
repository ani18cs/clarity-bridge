# ClarityBridge — System Parameters, Configuration & Specifications

This document provides a comprehensive technical catalog of all system parameters, environment configurations, heuristic thresholds, taxonomy definitions, and operational settings used across the **ClarityBridge** platform.

---

## 1. Environment & Runtime Parameters

| Parameter Key | Type | Default / Example Value | Mandatory | Description & Purpose |
|---|---|---|---|---|
| `NODE_ENV` | String | `production` \| `development` \| `test` | Yes | Controls logging verbosity, test mock switching, and security middleware strictness. |
| `PORT` | Integer | `8080` | Yes | Port on which the Express.js server listens (standard Cloud Run container port). |
| `GCP_PROJECT_ID` | String | `clarity-bridge-project-508306` | Yes | Google Cloud Platform Project ID hosting Cloud Run, GCS, Firestore, and AI APIs. |
| `GEMINI_API_KEY` | String | `[STORED_IN_SECRET_MANAGER]` | Yes | API credential for Google Generative AI (Gemini 2.5 / 1.5 Pro / Flash models). |
| `GCS_BUCKET_NAME` | String | `clarity-bridge-uploads-508306` | Yes | Google Cloud Storage bucket name for temporary encrypted document ingestion. |
| `JWT_SECRET` | String | `[256-BIT_HEX_SECRET]` | Yes | Secret used for HMAC-SHA256 signing of session tokens and shareable URLs. |
| `FRONTEND_URL` | String | `http://localhost:5173` \| `https://...` | Yes | Allowed origin for CORS validation and link generation in WhatsApp sharing. |
| `FIRESTORE_EMULATOR_HOST` | String | `localhost:8085` (optional) | No | Local emulator host for testing Firestore offline without cloud credentials. |
| `RATE_LIMIT_WINDOW_MS` | Integer | `900000` (15 minutes) | No | Sliding window duration for API rate limiting. |
| `RATE_LIMIT_MAX_REQUESTS` | Integer | `30` (1000 in test) | No | Maximum allowed analysis requests per IP / user within the time window. |
| `MAX_FILE_SIZE_BYTES` | Integer | `15728640` (15 MB) | Yes | Maximum permissible upload size for document images and PDF files. |

---

## 2. Document Taxonomy & Classification Enums

ClarityBridge categorizes ingested citizen documents into standardized taxonomy enums:

| Taxonomy Enum Code | Display Name (English) | Display Name (Hindi) | Display Name (Gujarati) | Typical Issuing Authority |
|---|---|---|---|---|
| `advocate_legal_notice` | Advocate Legal Notice (Land / Contractual Dispute) | वकील कानूनी नोटिस (जमीन / अनुबंध विवाद) | વકીલ કાનૂની નોટિસ (જમીન / કરાર વિવાદ) | High Court / Civil Court Advocate Chambers |
| `income_tax_notice` | Income Tax Department Intimation / Notice | आयकर विभाग सूचना / मांग नोटिस | આવકવેરા વિભાગ નોટિસ / માંગ પત્ર | Income Tax Department, Govt of India |
| `gst_notice` | Goods and Services Tax (GST) Notice | वस्तु एवं सेवा कर (जीएसटी) नोटिस / आदेश | GST નોટિસ / ઓર્ડર | Central Board of Indirect Taxes & Customs (CBIC) |
| `banking_loan_notice` | Bank / NBFC / Cheque Bounce (Sec 138 NI Act) Notice | बैंक / चेक बाउंस नोटिस | બેંક / ચેક બાઉન્સ કાનૂની નોટિસ | Commercial Banks / NBFCs / Financial Advocates |
| `utility_notice` | Municipal / Public Utility Notice | नगर निगम / सार्वजनिक उपयोगिता नोटिस | મ્યુનિસિપલ / વીજળી-પાણી બિલ નોટિસ | State Electricity Boards, Municipal Corporations |
| `court_summons` | Police / Judicial Court Summons | पुलिस / न्यायिक अदालत समन | પોલીસ / કોર્ટ સમન્સ | Judicial Magistrate / Metropolitan Courts |
| `eviction_notice` | Eviction Notice / Tenancy Lease Demand | बेदखली नोटिस / किरायेदारी मांग | મકાન ખાલી કરવાની નોટિસ | Property Owners / Rental Advocates |
| `suspicious_solicitation` | Suspicious Coercive Solicitation (High Fraud Risk) | संदिग्ध जबरन वसूली पत्र | શંકાસ્પદ છેતરપિંડી પત્ર | Fraudulent Entities / Impersonators |
| `general_document` | Official / Legal Document | आधिकारिक / कानूनी दस्तावेज | સત્તાવાર / કાનૂની દસ્તાવેજ | Generic Official Correspondences |

---

## 3. Extracted Entity Parameters & Schemas

Each document is parsed for high-fidelity grounded entities:

| Field Key | Type | Description | Grounding Rule |
|---|---|---|---|
| `recipientName` | Object (`value`, `source_text`, `confidence`) | Name of citizen or organization receiving the notice | Strict regex line-ending match; no cross-line bleeding. |
| `recipientAddress` | Object (`value`, `source_text`, `confidence`) | Full residential or office address of recipient | Extracted directly from notice header or address block. |
| `senderClientName` | Object (`value`, `source_text`, `confidence`) | Client/Complainant on whose behalf notice is issued | Extracted from *"under instructions from my client..."*. |
| `senderClientAddress` | Object (`value`, `source_text`, `confidence`) | Address of the client or sender | Extracted from instruction clause or sender block. |
| `underlyingAgreement` | Object (`value`, `source_text`, `confidence`) | Core agreement in dispute (e.g. *Satakhat Land Sale Agreement*) | Matches *"agreement to sell"*, *"satakhat"*, *"lease deed"*, etc. |
| `subject` | Object (`value`, `source_text`, `confidence`) | Subject line of legal notice or intimation | Extracted from *"Sub:"* or *"Subject:"* block. |
| `caseOrReferenceNumber` | Object (`value`, `source_text`, `confidence`) | Reference number or case ID (e.g. `Ref: JD/101/2015`) | Extracted via prefix search (`Ref:`, `Notice No:`, `Case No:`). |
| `noticeDate` | Object (`value`, `source_text`, `confidence`) | Date of issuance | Standardized to `DD/MM/YYYY` or textual format. |
| `dueDate` | Object (`value`, `source_text`, `confidence`) | Compliance deadline (e.g. 15 days, 30 days) | Extracted from notice limitation clause. |
| `amountDue` | Object (`value`, `source_text`, `confidence`) | Demand amount in Indian Rupees (INR) | Formatted as `₹XX,XXX` with numeric validation. |
| `din` | Object (`value`, `source_text`, `confidence`) | 20-character Income Tax Document Identification Number | Validated against ITD Circular 19/2019 standards. |
| `gstin` | Object (`value`, `source_text`, `confidence`) | 15-character Goods & Services Tax Identification Number | Validated against 15-digit alphanumeric state-coded pattern. |
| `pan` | Object (`value`, `source_text`, `confidence`) | 10-character Permanent Account Number | Regex format `[A-Z]{5}[0-9]{4}[A-Z]{1}`. |
| `aadhaar` | Object (`value`, `source_text`, `confidence`) | 12-digit Indian National Identity Number | **Masked u/s UIDAI**: `XXXX-XXXX-1234`. |

---

## 4. Authenticity & Verification Parameters

| Parameter | Type / Range | Default Threshold | Operational Role |
|---|---|---|---|
| `authenticity.verdict` | Enum | `Verified` \| `Use Caution` \| `Likely Fraudulent` \| `Needs Manual Review` | Overall authenticity rating presented to the citizen. |
| `authenticity.confidence` | Float (0.00 – 1.00) | `0.90` (High), `0.70` (Med) | Confidence score computed from verifiable signals. |
| `redFlagThreshold` | Integer | `>= 2` | Minimum independent red flags required to trigger `Likely Fraudulent`. |
| `qualityThreshold` | Float | `0.40` | Minimum image resolution/sharpness score before triggering blur warning. |
| `ocrSafeguardTimeoutMs` | Integer | `25000` (25 seconds) | OCR timeout limit ensuring large scans are fully parsed without hanging. |

---

## 5. Indic Multilingual Parameters

| Language Code | Language Name | Native Script Name | Google Cloud TTS Voice Code |
|---|---|---|---|
| `en` (Default) | English | English (Indian / International) | `en-IN-Standard-D` |
| `gu` | Gujarati | ગુજરાતી | `gu-IN-Standard-A` |
| `hi` | Hindi | हिन्दी | `hi-IN-Standard-C` |
| `mr` | Marathi | मराठी | `mr-IN-Standard-A` |
| `ta` | Tamil | தமிழ் | `ta-IN-Standard-A` |
| `te` | Telugu | తెలుగు | `te-IN-Standard-A` |
| `bn` | Bengali | বাংলা | `bn-IN-Standard-A` |
| `kn` | Kannada | ಕನ್ನಡ | `kn-IN-Standard-A` |

---

## 6. Privacy & PII Redaction Regex Parameters (DPDP Act 2023)

| Target Identifier | Regex Pattern | Replacement Token |
|---|---|---|
| Indian PAN | `/[A-Z]{5}[0-9]{4}[A-Z]{1}/g` | `[REDACTED_PAN]` |
| Indian Aadhaar | `/\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/g` | `[REDACTED_AADHAAR]` |
| Email Addresses | `/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g` | `[REDACTED_EMAIL]` |
| Phone Numbers | `/(\+91[\s-]?)?[6-9]\d{9}\b/g` | `[REDACTED_PHONE]` |
| Bank Accounts | `/\b\d{9,18}\b/g` (filtered for dates/amounts) | `[REDACTED_ACCOUNT]` |
| Credit Cards | `/\b(?:\d{4}[ -]?){3}\d{4}\b/g` | `[REDACTED_CARD]` |
