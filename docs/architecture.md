# ClarityBridge — System Architecture & Technical Specification

## 1. System Overview

ClarityBridge is an enterprise-grade, accessible, privacy-centric web application designed to bridge the comprehension, trust, and action gaps when everyday citizens receive official or complex documents.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React + Vite)                       │
│  - Multi-input capture (Photo / PDF / Voice Recording / Text Paste)     │
│  - Accessible WCAG AA UI (Aria-live announcements, High-Contrast Cues)  │
│  - Interactive Action Plan, Authenticity Badges, Fact-Checking List     │
│  - Audio Player / Text-to-Speech & PDF Action Plan Export               │
│  - Multi-language Selection & History Drawer                            │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTPS REST / JSON
┌────────────────────────────────────▼────────────────────────────────────┐
│                        BACKEND API (Express on Cloud Run)               │
│  - Security: Helmet, CORS, Firebase Token Verification, Upload Limits   │
│  - Structured Cloud Logging (Sanitizing PII / Document Content)         │
│  - Multi-stage Analysis Pipeline Orchestrator                           │
└─────┬──────────────┬───────────────┬─────────────────┬─────────────┬────┘
      │              │               │                 │             │
      ▼              ▼               ▼                 ▼             ▼
┌───────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐ ┌─────────┐
│  Gemini   │ │ Speech API  │ │Fact-Checking│ │Authenticity Heur│ │ pdf-lib │
│Multimodal │ │ (STT / TTS) │ │(CustomSearch│ │(Domain, Scam,   │ │ Branded │
│Understanding│              │ & Grounding) │ │Logic, AI Signal)│ │ Export  │
└─────┬─────┘ └─────────────┘ └─────────────┘ └─────────────────┘ └─────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       GOOGLE CLOUD INFRASTRUCTURE                       │
│  - Cloud Firestore (User Submissions & Analysis History)                │
│  - Cloud Storage (Raw Document Uploads & Generated Action Plan PDFs)    │
│  - Secret Manager (Encrypted API Keys & Runtime Secrets)                │
│  - Firebase Authentication (Email/Password & Google Identity)           │
│  - Cloud Logging (Privacy-Compliant Audit & Pipeline Metrics)           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Document Processing Pipeline (`POST /api/analyze`)

1. **Upload & Ingest**:
   - Accepts `multipart/form-data` with document file (Image/PDF) or Audio file or pasted text.
   - Files are validated (MIME type whitelist, <= 15MB limit) and streamed to Cloud Storage.
   - If audio input is provided, the backend transcribes speech to text via Google Cloud Speech-to-Text.

2. **Gemini Multimodal Understanding**:
   - Calls Gemini (`gemini-2.5-flash` / Vertex AI) with image/PDF buffers or text transcripts.
   - Classifies document type (e.g. `eviction_notice`, `tax_assessment`, `benefits_denial`, `court_summons`, `utility_bill`, `suspicious_solicitation`).
   - Identifies the claimed issuing authority and extracts structured entities: dates, deadlines, amounts, obligations, and contact details.

3. **Authenticity & Fraud Evaluation**:
   - **Sender/Domain Cross-Check**: Compares claimed entity against known official government/utility patterns or search-grounded agency directory lookups.
   - **Scam-Pattern Heuristic Scan**: Detects high-pressure threats, unconventional payment requests (crypto, gift cards, wire transfer), generic salutations, and suspicious routing.
   - **Internal Consistency Validation**: Audits date logic (e.g., due dates prior to notice date), amount discrepancies, or conflicting case references.
   - **Linguistic Artifact Analysis**: Assesses indicators of synthetic/AI-generated scam templates.
   - Aggregates signals into a transparent **Risk Verdict** (`Verified`, `Use Caution`, `Likely Fraudulent`) accompanied by human-readable explanation bullet points.

4. **Fact-Checking Engine**:
   - Isolates 2–5 checkable factual assertions (e.g. fee schedules, cited legal codes, authority existence, published phone numbers).
   - Queries Google Custom Search API or Gemini Search Grounding.
   - Classifies each claim as `Verified`, `Unverifiable`, or `Contradicted` with verifiable citation references.

5. **Plain-Language Summary & Prioritized Action Plan**:
   - Gemini synthesizes the extracted data, authenticity verdict, and verified facts into a compassionate, 6th-grade reading level summary.
   - Formulates step-by-step prioritized action items tagged with urgency levels (`Urgent`, `High`, `Medium`, `Low`), explicit calendar deadlines, and direct verified contacts.
   - Translates the entire output into the user's requested target language.

6. **Persistence & Response**:
   - Stores the structured submission in Cloud Firestore under the user's account (`users/{userId}/submissions/{submissionId}`).
   - Returns structured JSON to the frontend.

---

## 3. PDF Generation (`POST /api/pdf`)
- Uses `pdf-lib` to render high-contrast, branded, printable Action Plans directly matching on-screen results.
- Includes quick-action checklists, urgency badges, authority contacts, and mandatory legal disclaimers.

---

## 4. Speech Synthesis (`POST /api/speech/synthesize`)
- Converts plain-language summaries into natural audio using Google Cloud Text-to-Speech with browser Web Speech API fallback.
