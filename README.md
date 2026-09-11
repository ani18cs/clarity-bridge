# ClarityBridge — Universal Citizen Document & Fraud Triage Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-blue.svg)](https://ai.google.dev/)
[![Google Cloud](https://img.shields.io/badge/Platform-Google%20Cloud%20Run-blue.svg)](https://cloud.google.com/run)
[![WCAG](https://img.shields.io/badge/Accessibility-WCAG%20AA-success.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)

> **A Gemini-powered universal bridge between confusing official documents, scam notices, and clear, verified human action.**

---

## 📖 1. The Problem & Societal Mission

Every day, millions of vulnerable citizens — elderly individuals, low-income families, immigrants, and people with disabilities — receive official, legal, and financial documents they cannot safely interpret or act upon:
- **Eviction notices & rent demands** with strict 14-day statutory deadlines.
- **Benefit termination letters** (Medicaid, SNAP, Disability) with dense procedural requirements.
- **Utility shutoff warnings** with hidden relief programs.
- **Predatory scam solicitations & fake arrest warrants** designed to induce panic and extort payments via gift cards or cryptocurrency.

Three compounding failure modes endanger citizens:
1. **The Comprehension Gap**: Bureaucratic language causes missed deadlines and forfeitures.
2. **The Trust Gap**: Citizens cannot distinguish genuine court notices from fraudulent letters.
3. **The Access Gap**: Low-literacy or non-native English speakers face steep language barriers.

**ClarityBridge** takes any unstructured input — a smartphone photo, PDF scan, voice description, or pasted text — and instantly produces a **plain-language summary (6th-grade reading level)**, an **authenticity risk verdict with transparent reasons**, **grounded fact-check annotations**, a **downloadable branded PDF action plan**, and **read-aloud speech synthesis**.

---

## 🏗️ 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React + Vite + Tailwind)                 │
│  - Multi-Input Capture: Drag-and-Drop, PDF, Camera, Microphone, Paste Text │
│  - WCAG AA Accessible Design System (High Contrast, Screen Reader Live)     │
│  - Ordered Action Steps, Interactive Checkboxes, Direct Authority Contacts  │
│  - Multi-Language Selector (EN, ES, FR, HI, ZH, VI, TL, AR)                 │
│  - Branded PDF Export & Natural Text-to-Speech Read Aloud                   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS REST (JSON / Multipart)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    BACKEND REST API (Node.js + Express)                     │
│  - Deployed as a Containerized Service on Google Cloud Run                  │
│  - Security: Helmet, CORS, Firebase Admin Auth, Multer 15MB Whitelisting    │
│  - Privacy: Cloud Logging with Automatic PII & Document Content Redaction   │
└──────┬───────────────┬────────────────┬─────────────────┬──────────────┬────┘
       │               │                │                 │              │
       ▼               ▼                ▼                 ▼              ▼
┌────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  ┌────────┐
│   Gemini   │  │   Speech    │  │ Fact-Check  │  │  Authenticity │  │pdf-lib │
│  2.5 Flash │  │  STT / TTS  │  │Custom Search│  │Heuristic Layer│  │Branded │
│(Multimodal)│  │ (Cloud API) │  │ & Grounding │  │ (4-Tier Risk) │  │  PDF   │
└──────┬─────┘  └─────────────┘  └─────────────┘  └───────────────┘  └────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GOOGLE CLOUD INFRASTRUCTURE                         │
│  • Google Cloud Run — Serverless container auto-scaling                     │
│  • Google Cloud Secret Manager — Runtime secret and API key encryption      │
│  • Cloud Firestore — User submission and action plan persistence            │
│  • Cloud Storage — Uploaded document archives and generated PDF storage     │
│  • Firebase Authentication — Email/Password & Google Identity Federation    │
│  • Cloud Logging — Auditable, privacy-compliant JSON operational telemetry  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ☁️ 3. Google Cloud & Gemini Services Used (And Why)

| Google Service | Architectural Purpose | Societal & Scoring Benefit |
| :--- | :--- | :--- |
| **Gemini 2.5 Flash / Vertex AI** | Multimodal OCR, entity extraction (dates, amounts, case numbers), plain-language translation, and synthetic text analysis. | High-speed, high-reasoning multimodal document understanding directly from photos and PDFs. |
| **Google Cloud Run** | Serverless production container hosting the unified backend and frontend. | Zero-maintenance auto-scaling, high reliability, and fast response times. |
| **Google Cloud Storage** | Secure storage of uploaded raw document images, PDFs, and generated action plans. | Encrypted, durable cloud object storage with signed URL access control. |
| **Cloud Firestore** | NoSQL database storing structured submissions, action plans, and user history. | Real-time indexing, user isolation, and structured record persistence. |
| **Google Cloud Secret Manager** | Securely supplies runtime API keys (`GEMINI_API_KEY`, `CUSTOM_SEARCH_API_KEY`) to Cloud Run. | Zero credential exposure in code or version control. |
| **Cloud Speech-to-Text API** | Transcribes audio recordings from citizens describing their notices or reading aloud. | Critical accessibility for low-literacy or visually impaired citizens. |
| **Cloud Text-to-Speech API** | Natural voice audio synthesis of document summaries and action steps. | Screen-free accessibility and multi-language auditory assistance. |
| **Google Custom Search API & Search Grounding** | Cross-references cited statutory codes, municipal addresses, and official agency phone numbers. | Real-time, defensible fact-checking that refutes fraudulent claims. |
| **Firebase Authentication** | Identity management via Google Sign-In and Email/Password with guest fallback. | Secure citizen session persistence and history access. |
| **Cloud Logging** | Structured JSON logs recording pipeline stages and latency without logging user PII. | High-observability operational metrics adhering to strict privacy requirements. |

---

## 🛡️ 4. 4-Tier Authenticity & Fraud Risk Engine

ClarityBridge evaluates authenticity across four weighted risk signals:
1. **Authority & Domain Cross-Check**: Compares claimed agency names and contact info against verified government patterns (`.gov`, `.mil`, municipal registries). Flags claimed agencies using free email providers (e.g. `@gmail.com`).
2. **Scam-Pattern Heuristic Scanner**: Scans for high-pressure threats (immediate arrest warrants, deportations) and irregular payment demands (gift cards, Bitcoin, wire transfers).
3. **Internal Logic & Timeline Audit**: Audits consistency between notice issue dates and response deadlines (e.g., deadline preceding notice date).
4. **Synthetic Phishing Linguistic Analysis**: Evaluates generic impersonal greetings and AI-generated scam template density.

---

## 📂 5. Repository Structure

```
clarity-bridge/
├── README.md                      # Comprehensive project documentation
├── .gitignore                     # Git ignore rules for node_modules, .env, and builds
├── .env.example                   # Documented environment variable template
├── Dockerfile                     # Multi-stage production container for Cloud Run
├── frontend/                      # React + Vite + Tailwind CSS Accessible Web App
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── components/            # UploadZone, ProcessingView, AuthenticityBadge, ActionPlanView, etc.
│       ├── hooks/                 # useAuth, useSpeech
│       ├── utils/                 # api.js, firebase.js
│       ├── pages/                 # Home.jsx
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
├── backend/                       # Node.js + Express REST API
│   ├── package.json
│   ├── Dockerfile
│   └── src/
│       ├── config/                # env.js, firebaseAdmin.js
│       ├── middleware/            # auth.js, validateUpload.js, errorHandler.js, logger.js
│       ├── services/              # gemini.service.js, authenticity.service.js, factcheck.service.js, pdf.service.js, speech.service.js, storage.service.js, firestore.service.js
│       ├── routes/                # analyze.js, pdf.js, speech.js, history.js
│       ├── utils/                 # sanitize.js
│       ├── tests/                 # 7 test suites, 25 unit & integration tests
│       └── index.js
├── infra/
│   ├── deploy.sh                  # One-click Cloud Run deployment script
│   └── cloudbuild.yaml            # Cloud Build CI/CD workflow
└── docs/
    ├── architecture.md            # Detailed component & sequence diagrams
    └── api-spec.md                # REST API endpoint contracts
```

---

## 🚀 6. Local Setup & Quick Start

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0

### Step 1: Clone Repository & Install Dependencies
```bash
git clone https://github.com/your-username/clarity-bridge.git
cd clarity-bridge

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
cd ..
```

### Step 2: Configure Environment Variables
Create a `.env` file in the project root:
```env
PORT=8080
NODE_ENV=development
GCP_PROJECT_ID=your-gcp-project-id
GEMINI_API_KEY=your-gemini-api-key
CUSTOM_SEARCH_API_KEY=your-custom-search-api-key
CUSTOM_SEARCH_ENGINE_ID=your-search-engine-id
```

### Step 3: Run Automated Test Suite
```bash
cd backend
npm test
```
*Expected: 7 test suites passing, 25 tests passing.*

### Step 4: Start Local Development Servers
```bash
# Terminal 1: Start Backend API
cd backend
npm run dev

# Terminal 2: Start Frontend Development Server
cd frontend
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🚢 7. Production Deployment (Google Cloud Run)

Deploy using the automated deployment script:
```bash
chmod +x infra/deploy.sh
./infra/deploy.sh <your-gcp-project-id> us-central1
```

Or deploy directly via Google Cloud CLI:
```bash
gcloud builds submit --tag gcr.io/$GCP_PROJECT_ID/clarity-bridge:latest .
gcloud run deploy clarity-bridge \
  --image gcr.io/$GCP_PROJECT_ID/clarity-bridge:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,GCP_PROJECT_ID=$GCP_PROJECT_ID" \
  --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest"
```

---

## ♿ 8. Accessibility & Responsible AI Disclaimers

### Accessibility Conformance (WCAG 2.1 AA)
- **Non-Color-Only Statuses**: Every priority state, authenticity verdict, and fact-check tag is paired with an icon and clear text description.
- **Screen Reader Announcements**: An `aria-live="polite"` live region communicates pipeline progress.
- **Full Keyboard Operability**: All interactive dropzones, accordions, and buttons feature visible `focus-visible` focus rings.
- **Auditory Access**: Integrated Read Aloud speech synthesis supports low-literacy and visually impaired citizens.

### Mandatory Legal Disclaimer
> *"ClarityBridge helps you understand and act on documents — it is not a lawyer, accountant, or government agency, and does not replace professional legal or financial advice. Authenticity and fact-check results are risk signals based on available information, not a guarantee. When in doubt, contact the issuing authority directly using verified public directory phone numbers."*

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
