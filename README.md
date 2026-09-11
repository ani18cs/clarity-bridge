# ClarityBridge — Universal Bridge Between Human Intent and Complex Systems

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-blue.svg)](https://ai.google.dev/)
[![Google Cloud](https://img.shields.io/badge/Platform-Google%20Cloud%20Run-blue.svg)](https://cloud.google.com/run)
[![WCAG](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-success.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![Security](https://img.shields.io/badge/Security-OWASP%20LLM%202026%20%7C%20NIST%20AI%20RMF-blueviolet.svg)](SECURITY.md)
[![Automated Tests](https://img.shields.io/badge/Tests-52%2F52%20Passing%20(100%25)-brightgreen.svg)](SECURITY_TESTING.md)

> **ClarityBridge** is an AI-powered universal bridge that takes messy, confusing real-world inputs (smartphone photos, multi-page PDFs, voice descriptions, or pasted text) of ANY official or unofficial document and returns structured, verified, grounded, actionable outputs: a plain-language summary, a prioritized action plan with statutory deadlines, a 4-tier authenticity verdict with itemized transparency signals, fact-checked claims with honest source citations, a downloadable branded PDF, and assistive read-aloud speech synthesis.

---

## 🏛️ Core UX & DPDP Act 2023 Disclaimer

> ⚠️ **IMPORTANT CIVIC & DATA PRIVACY NOTICE**:
> **ClarityBridge is an assistive triage, translation, and document comprehension tool.** It does **not** provide legal, financial, tax, or government advice. Authenticity verdicts and fact-checking assessments are decision-support risk signals, not legal determinations.
> In accordance with India's **Digital Personal Data Protection (DPDP) Act 2023** and UIDAI privacy directives, all uploaded documents are processed ephemerally in memory with automatic 4-digit Aadhaar masking (`XXXX-XXXX-1234`) and zero persistent raw PII retention. Always verify statutory notices directly with official portals ([incometax.gov.in](https://incometax.gov.in), [gst.gov.in](https://gst.gov.in), [sachet.rbi.org.in](https://sachet.rbi.org.in), [cybercrime.gov.in](https://cybercrime.gov.in) — Helpline 1930).

---

## 🎯 Accuracy, Safeguards & Limitations (Honest AI Positioning)

ClarityBridge follows a strict **"Never Guess, Never Fabricate"** architectural principle: a wrong confident answer is significantly more dangerous than an honest *"not found"* or *"needs manual review."*

### 1. Grounded Extraction & Anti-Hallucination
- **Exact Source Spans**: Every extracted structured field (dates, amounts, DIN, PAN, case numbers, deadlines) must be accompanied by the exact text span in the original document.
- **Grounding Cross-Validator**: A post-extraction validator verifies that the claimed source text appears in the raw document OCR/transcript. Any ungrounded field is marked `confidence: "low"` and surfaced to the user as *"Could not verify from the document — please check the original"*.
- **Strict Null Preservation**: If a deadline, amount, or contact is not explicitly stated in the document, the field strictly returns `null` / *"Not stated in document"* — it is never inferred or guessed from typical templates.
- **Image Quality & Resolution Assessment**: Pre-checks scans and smartphone photos for extreme blur, low resolution, or corruption. If readability is impaired, it instructs the citizen to retake the photo rather than producing low-confidence extractions.
- **Multi-Page PDF Integrity**: Multi-page PDF submissions track explicit page count metadata to prevent single-page truncation.

### 2. Constrained Taxonomy & Routing
- Classifies documents against an explicit defined enum taxonomy (Income Tax, GST, Bank/NBFC Loan Recovery u/s 138 NI Act, Municipal Utility, Police/Court, EPFO, UIDAI, Academic, Invoice, Suspicious Solicitation, General Document).
- Computes confidence scores and top-2 candidate categories. If confidence is below 0.65 or candidates are close, it cleanly falls back to *"Needs Manual Review"*.

### 3. Multi-Signal Authenticity (4-Tier Verdict System)
- **Multi-Signal Requirement**: Requires **at least two independent red flags** to agree before returning `Likely Fraudulent` — a single suspicious phrase never triggers the most severe verdict on its own (single flag returns `Use Caution`).
- **4-Tier Verdict States**:
  1. `Verified` (Green Stamp) — Domain, registry, and dates verified.
  2. `Use Caution` (Amber Stamp) — Single point of concern or unverified commercial domain.
  3. `Likely Fraudulent` (Red Stamp) — $\ge 2$ independent red flags (e.g. coercive arrest threat + gift card/crypto payment demand).
  4. `Needs Manual Review` (Periwinkle Stamp) — Triggered when signals conflict (e.g., official `.gov.in` domain but suspicious phrasing) or extraction confidence is low.
- **Income Tax DIN Verification**: Under ITD Circular No. 19/2019, any communication issued after 1-Oct-2019 without a 20-digit DIN is legally invalid; ClarityBridge flags missing DINs and provides direct links to the official ITD Notice Authenticator.

### 4. Honest Fact-Checking (No Fabricated Sources)
- Factual claims are corroborated against authoritative statutory registries and Google Search grounding.
- If a claim cannot be verified against a credible public record, it is strictly tagged as **`Unverifiable`** with `source: null` — never generating fabricated citations.

---

## 🌟 Key Platform Features

### 1. 🌐 Multi-Language Support (Indian Languages)
- **English Default** plus comprehensive support for major Indian languages: **Gujarati (ગુજરાતી)**, **Hindi (हिन्दी)**, **Tamil (தமிழ்)**, **Telugu (తెలుగు)**, **Kannada (ಕನ್ನಡ)**, **Bengali (বাংলা)**, and **Marathi (मराठी)**.
- **Dynamic On-The-Fly Translator**: Instant language toggle on results screen with zero re-upload latency.
- Selected language translates the plain-language summary, document parties, legal implications, statutory rights, action plan steps, "Why this verdict" transparency signals, fact-check notes, and drives localized **Text-to-Speech (TTS)** voice synthesis (`hi-IN`, `gu-IN`, `ta-IN`, `te-IN`, `kn-IN`, `bn-IN`, `mr-IN`, `en-IN`).
- Input handling is **language-agnostic**: Gemini OCRs and understands documents in any Indian or international language or bilingual formats.

### 2. 🔗 Scoped 7-Day Result Sharing
- **1-Click Share**: Pre-filled **WhatsApp deep link** (`wa.me/?text=...`), instant **Copy Link**, and native mobile **Web Share API**.
- **Scoped & Privacy-Protected**: Generates a random, unguessable ID (`CB-<hex>`) with **strict 7-day expiration**.
- **Zero Login Required for Recipient**: Recipients view a dedicated read-only page without exposing the sender's account, user ID, or other documents.
- **Clear Civic Attribution**: Labeled with `"Shared via ClarityBridge — an assistive translation/triage tool, not a lawyer or government agency"`.

### 3. 🚨 Fraud Reporting Assist
- When authenticity verdict is `Use Caution` or `Likely Fraudulent`, a prominent **"Report this notice"** action appears.
- Generates a **pre-filled complaint draft** using structured extracted fields (claimed authority, contact channels used, amount demanded, red flags detected) ready for 1-click clipboard copy.
- Direct links and instructions for official Indian portals:
  - **National Cyber Crime Reporting Portal** ([cybercrime.gov.in](https://cybercrime.gov.in)) & **National Helpline 1930** for all cyber/financial fraud.
  - **RBI Sachet Portal** ([sachet.rbi.org.in](https://sachet.rbi.org.in)) for illegal loan apps, fake recovery agents, and unauthorized bank/NBFC notices.
- **Zero Excessive Agency**: Strictly a drafting aid — citizens submit the complaint themselves on official government portals (never auto-submitted).
- Personal contact details are excluded by default unless the user explicitly opts in.

### 4. 🔍 "Why This Verdict?" Transparency Panel
- Expandable accordion below the verdict stamp detailing an itemized breakdown across multi-source verification checks:
  1. *Sender & Domain Verification* (Official `.gov.in` / institutional domain checks)
  2. *Income Tax DIN Verification* (20-digit statutory DIN verification under Circular 19/2019)
  3. *Payment Method Authenticity* (Gift cards, crypto, UPI tags vs authorized banking)
  4. *Coercion & Urgency Language Scan* (Threats of immediate arrest or digital arrest)
  5. *Timeline & Logic Consistency* (Chronological validation between notice date and due date)
  6. *Community Scam Pool Match* (Comparison with anonymized community fraud reports)
- Accessible text + icon status badges (`✔ SUPPORTS AUTHENTICITY`, `🚨 CONCERNS AUTHENTICITY`, `ℹ️ NEUTRAL SIGNAL`) complying with WCAG 2.1 AA.
- 1-Click direct links to official self-verification portals: Income Tax DIN Authenticator, GST Portal, RBI Sachet, and Cyber Crime Helpline 1930.

### 5. 👥 Shared Community Scam-Pattern Pool
- Shared Firestore collection `scamPatterns` storing collective fraud signatures across users.
- **Strict PII Scrubbing**: All submitted patterns pass through a regex scrubber that replaces Indian PAN (`[REDACTED_PAN]`), Aadhaar (`[REDACTED_AADHAAR]`), phone numbers (`[REDACTED_PHONE]`), emails (`[REDACTED_EMAIL]`), credit cards (`[REDACTED_CARD]`), and bank accounts (`[REDACTED_ACCOUNT]`).
- **Data-Scope Disclosure**: Clear notice informs users that only anonymized threat patterns (never document images or private data) are shared.
- **Upload Matching**: New uploads are compared against the community scam pool and matched reports factor into the authenticity score and transparency panel.

### 6. 📄 Server-Rendered Puppeteer PDF Export
- Replaces low-level coordinate drawing with Headless Chromium server-rendered HTML/CSS print templates (`pdfTemplate.js`).
- **Visual Parity**: Shares exact web UI tokens, Baloo 2 and Inter fonts, Google Noto Sans Indic fonts, `₹` INR currency symbol, `DD/MM/YYYY` Indian date formats, and `page-break-inside: avoid` card containers.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React + Vite + Tailwind)                 │
│  - Multi-Input Capture: Drag-and-Drop, PDF, Camera, Microphone, Paste Text │
│  - WCAG 2.1 AA Accessible Design (High Contrast, Focus Rings, Screen Reader)│
│  - 7 Supported Languages (English, Hindi, Tamil, Telugu, Kannada, etc.)      │
│  - "Why this verdict?" Itemized Transparency Accordion with Portal Links    │
│  - Scoped 7-Day Shared View (/shared/:shareId) & WhatsApp Deep Link         │
│  - Fraud Complaint Drafting Aid & Community Scam Pool Modal                 │
│  - DPDP Act 2023 Compliance Notices & Masked Aadhaar Display                │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS REST (JSON / Multipart)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    BACKEND REST API (Node.js + Express)                     │
│  - Deployed as a Containerized Service on Google Cloud Run                  │
│  - Security: Helmet, Strict CORS, Firebase Admin Auth, Multer 15MB Limits   │
│  - Rate Limiting: express-rate-limit (30 req / 15 min per user)             │
│  - Grounding Validator: Strict source_text verification against OCR text    │
│  - PII Scrubber: Pre-storage redaction for PAN, Aadhaar, phone, email       │
│  - Shared Link Generator: Unguessable 16-hex token with 7-day TTL           │
└──────┬───────────────┬────────────────┬─────────────────┬──────────────┬────┘
       │               │                │                 │              │
       ▼               ▼                ▼                 ▼              ▼
┌────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  ┌────────┐
│   Gemini   │  │   Speech    │  │ Fact-Check  │  │ Authenticity  │  │Puppeteer
│  2.5 Flash │  │  STT / TTS  │  │Custom Search│  │  Multi-Signal │  │Headless│
│(Multimodal)│  │ (Cloud API) │  │ & Grounding │  │ & DIN / Sachet│  │  PDF   │
└──────┬─────┘  └─────────────┘  └─────────────┘  └───────────────┘  └────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GOOGLE CLOUD INFRASTRUCTURE                         │
│  • Google Cloud Run — Serverless container auto-scaling (Scale-to-zero)    │
│  • Google Cloud Secret Manager — Runtime secret and API key encryption      │
│  • Cloud Firestore — User submissions and shared `scamPatterns` pool        │
│  • Cloud Storage — Uploaded document archives and generated PDF storage     │
│  • Firebase Authentication — Email/Password & Google Identity Federation    │
│  • Cloud Speech-to-Text & Text-to-Speech — Voice accessibility & TTS        │
│  • Cloud Logging — Auditable, privacy-compliant JSON operational telemetry  │
│  • Cloud Monitoring — Uptime health checks and latency monitoring           │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ☁️ Google Services Used (And Why)

| # | Google Service | Architectural Purpose | Societal & Operational Justification |
| :-: | :--- | :--- | :--- |
| **1** | **Gemini 2.5 Flash / Vertex AI** | Multimodal OCR, grounded entity extraction, plain-language translation in 7 languages, and constrained taxonomy classification. | Fast, highly accurate multimodal document comprehension directly from photos, scans, and PDFs at zero cost. |
| **2** | **Google Cloud Run** | Serverless production container hosting the unified backend and frontend. | Zero-maintenance auto-scaling, scale-to-zero when idle (₹0 idle cost), fast cold starts, and container portability. |
| **3** | **Firebase Authentication** | Identity management via Google Sign-In and Email/Password with guest fallback. | Secure citizen session persistence and per-request server-side token authorization. |
| **4** | **Cloud Firestore** | NoSQL database storing user submissions, scoped share views, and the shared `scamPatterns` pool. | Real-time indexing, user isolation, and collective scam signature persistence. |
| **5** | **Google Cloud Storage** | Secure storage of uploaded raw document images, PDFs, and generated action plans. | Encrypted cloud object storage with short-lived signed URLs (24h expiry) and Uniform Bucket-Level Access. |
| **6** | **Google Cloud Secret Manager** | Securely supplies runtime API keys (`GEMINI_API_KEY`, `CUSTOM_SEARCH_API_KEY`) to Cloud Run. | Zero credential exposure in code or committed `.env` files. |
| **7** | **Cloud Speech-to-Text API** | Transcribes audio recordings from citizens describing their notices or reading aloud. | Critical accessibility for low-literacy or visually impaired citizens. |
| **8** | **Cloud Text-to-Speech API** | Natural voice audio synthesis in English, Hindi, Tamil, Telugu, Kannada, Bengali, and Marathi. | Screen-free accessibility and multi-language auditory assistance. |
| **9** | **Google Custom Search API & Search Grounding** | Cross-references cited statutory codes, municipal addresses, and official agency phone numbers. | Real-time fact-checking that refutes fraudulent claims and verifies issuers. |
| **10** | **Cloud Logging** | Structured JSON logs recording pipeline stages and latency without logging user PII. | High-observability operational metrics adhering to strict privacy requirements. |
| **11** | **Cloud Monitoring** | Uptime health checks and service latency telemetry on `/api/health`. | Continuous service availability monitoring and SLA tracking. |

---

## 🧪 Automated Testing & Verification

The project includes a comprehensive test suite using **Jest + Supertest** (**52 tests across 13 test suites** — 100% passing):

```bash
# Run all backend unit & integration tests
cd backend
npm test
```

### Test Coverage Summary (52/52 Passing — 100%)
- **Grounded Extraction & Anti-Hallucination (`groundedExtraction.test.js`)**: Tests missing fields returning `null` / "Not stated", ungrounded source spans flagged `confidence: "low"`, UIDAI Aadhaar 4-digit masking (`XXXX-XXXX-1234`), and low-quality blurry image warnings.
- **Authenticity Refinement & False-Positive Prevention (`authenticityRefinement.test.js` & `authenticityService.test.js`)**: Tests routine legitimate notices returning `Verified` (false-positive prevention), single red flag returning `Use Caution`, $\ge 2$ independent red flags returning `Likely Fraudulent`, conflicting signals returning `Needs Manual Review`, and Income Tax DIN statutory checks under Circular 19/2019.
- **Honest Fact-Checking (`factcheckRefinement.test.js` & `factcheckService.test.js`)**: Asserts uncorroborated search claims return `Unverifiable`, verified claims strictly include authentic citations, and batch queries auto-downgrade unreferenced claims.
- **Puppeteer Headless PDF Export (`puppeteerPdf.test.js` & `pdfService.test.js`)**: Validates server-rendered HTML-to-PDF generation with INR `₹` currency glyphs and Indic script support.
- **Share Route & Public Access (`shareAndCommunity.test.js`)**: 7-day expiration, unguessable IDs, public read-only access, isolation against cross-user enumeration.
- **PII Scrubber Guardrails (`piiScrubber.test.js`)**: Strips PAN, Aadhaar, email, phone, credit card, and bank accounts before community write.
- **Upload Validation (`uploadValidation.test.js`)**: Rejects empty inputs, validates oversized files and MIME types.
- **Authorization & Isolation (`apiRoutes.test.js`)**: Verifies user A cannot access user B's submissions.
- **Speech Services (`speechService.test.js`)**: Tests TTS synthesis across Indian languages and STT audio handling.

---

## 🚀 Local Setup & Quick Start

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0

### Step 1: Clone & Install Dependencies
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
cd ..
```

### Step 2: Configure Environment
Copy `.env.example` to `.env`:
```env
PORT=8080
NODE_ENV=development
GCP_PROJECT_ID=clarity-bridge-project-508306
GEMINI_API_KEY=your-gemini-api-key
CUSTOM_SEARCH_API_KEY=your-custom-search-api-key
CUSTOM_SEARCH_ENGINE_ID=your-search-engine-id
```

### Step 3: Run Tests & Start Servers
```bash
# Run backend test suite
cd backend && npm test

# Terminal 1: Start Backend API (Port 8080)
cd backend && npm run dev

# Terminal 2: Start Frontend Dev Server (Port 5173)
cd frontend && npm run dev
```
## 📂 Project Structure & Documentation Indexes
- **[parameters/PARAMETERS.md](parameters/PARAMETERS.md)**: Catalog of environment variables, taxonomy schemas, heuristics, and PII regex parameters.
- **[parameters/GOOGLE_SERVICES_AND_RESOURCES.md](parameters/GOOGLE_SERVICES_AND_RESOURCES.md)**: Full breakdown of all Google Cloud and Google AI services used, architectural role, and free credit optimization.
- **[test/SAMPLE_DOCUMENT_TEST_RESULTS.md](test/SAMPLE_DOCUMENT_TEST_RESULTS.md)**: Empirical test results across 5 sample documents (Advocate Legal Notice / Satakhat Land Dispute, IT Notice u/s 156, Fake ITD Arrest Scam, Sec 138 Cheque Bounce, MSEDCL Electricity Notice).
- **[test/AUTOMATED_TEST_SUITE_REPORT.md](test/AUTOMATED_TEST_SUITE_REPORT.md)**: Official execution report covering all 13 test suites and 52 unit/integration tests with 100% pass rate.
- **[SECURITY.md](SECURITY.md)**: OWASP LLM Top 10 (2026) & NIST AI RMF implementation matrix.
- **[SECURITY_TESTING.md](SECURITY_TESTING.md)**: Automated security test report and adversary threat mitigation.

---

## 🚢 Production Deployment to Google Cloud Run

Deploy with the automated script:
```bash
chmod +x infra/deploy.sh
./infra/deploy.sh clarity-bridge-project-508306 us-central1
```

Or trigger automated container build with Google Cloud Build:
```bash
gcloud builds submit --config infra/cloudbuild.yaml .
```

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
