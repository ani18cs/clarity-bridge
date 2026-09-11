# ClarityBridge — Architecture & Roadmap
### A Gemini-powered universal bridge between confusing official documents and clear, verified human action

**Built for:** PromptWars X — Techverse Challenge
**Challenge fit:** "Build a Gemini-powered app that solves societal benefit by acting as a universal bridge between human intent and complex systems" — takes messy, real-world input (photos, voice, documents) and turns it into structured, verified, life-affecting actions.

---

## 1. The Problem

Millions of people — elderly citizens, immigrants, low-literacy or low-income individuals, people with disabilities — receive official or semi-official documents they cannot safely act on: eviction notices, benefit denial letters, tax notices, insurance denials, court summons, utility shutoff warnings, immigration paperwork, even scam letters designed to look official. Three failure modes stack on top of each other:

1. **Comprehension gap** — legal/bureaucratic language is deliberately dense; people miss deadlines or misunderstand obligations.
2. **Trust gap** — people can't tell a genuine government notice from a forged or scam document, so they either ignore real ones or panic-comply with fake ones (a huge and growing fraud vector).
3. **Access gap** — the people most affected often can't read well, don't speak the document's language, or don't have anyone to ask.

**ClarityBridge** takes a photo, PDF, or voice description of *any* official/unofficial document, verifies it, and returns a plain-language, verified action plan — with a downloadable PDF and read-aloud support.

---

## 2. Product Scope

### 2.1 Inputs supported (per challenge requirement — "any type of unstructured input")
| Input type | Example |
|---|---|
| Photo / scan | Eviction notice, benefit letter, traffic ticket, tax notice |
| PDF upload | Court document, insurance letter, contract |
| Voice | "I got this letter, what does it mean, what do I owe?" |
| Typed text | Pasted email/SMS text of a suspicious message |

### 2.2 Core outputs
1. **Plain-language summary** — what this document is, who sent it, why it matters.
2. **Structured action plan** — deadlines, amounts owed, required steps, who to contact (phone/address), in order of urgency.
3. **Authenticity verdict** — Verified / Suspicious / Likely Fraudulent, with the specific reasons (see §4.4).
4. **Fact-check annotations** — each factual claim in the document (amounts, cited laws, deadlines, sender identity) checked against public sources where possible, each tagged Verified / Unverifiable / Contradicted.
5. **Downloadable PDF** of the full action plan, in the user's chosen language.
6. **Optional read-aloud** of the summary and next steps (accessibility for low-literacy or visually impaired users).

### 2.3 Explicitly out of scope for the hackathon build
- Legal advice or guaranteed legal accuracy (the app is a **triage and translation layer**, not a lawyer — this must be stated in the UI as a disclaimer).
- Deep forensic image analysis (ink/paper analysis) — not feasible from a photo; authenticity checks are **content- and metadata-based**, not physical-forensic.
- Guaranteed detection of all AI-generated text — flagged as a **risk signal**, not a certainty.

---

## 3. System Architecture

### 3.1 High-level diagram (describe to Antigravity as a component diagram)

```
┌─────────────────────────────┐
│         FRONTEND             │   React + Vite + Tailwind, deployed as
│  (Web app, mobile-responsive)│   static assets served via Cloud Run
└──────────────┬───────────────┘
               │ HTTPS (REST/JSON)
┌──────────────▼───────────────┐
│      BACKEND API (Cloud Run)  │   Node.js (Express) or Python (FastAPI)
│  /api/analyze  /api/pdf       │
│  /api/speech   /api/history   │
└──┬───────┬───────┬───────┬───┘
   │       │       │       │
   ▼       ▼       ▼       ▼
Gemini   Speech   Fact-    PDF
(Vertex  -to-Text /Check   Gen
 AI)     & TTS    Service  Service
   │
   ▼
┌─────────────────────────────┐
│   Firestore (structured data) │
│   Cloud Storage (raw uploads) │
│   Secret Manager (API keys)   │
│   Firebase Auth (users)       │
│   Cloud Logging (audit trail) │
└─────────────────────────────┘
```

### 3.2 Component responsibilities

**Frontend**
- Multi-input capture: drag-and-drop / camera capture for images & PDFs, a microphone button for voice, a text box for pasted content.
- Result view: color-coded urgency cards (see §5 UI/UX), authenticity badge, fact-check list, "Download PDF" and "Read aloud" buttons.
- Language selector (drives output translation).
- Fully keyboard-navigable and screen-reader labeled (see §5.3).

**Backend API (Cloud Run)**
- `POST /api/analyze` — accepts file(s) and/or voice transcript + optional text question; orchestrates the pipeline below; returns structured JSON.
- `POST /api/pdf` — takes an action-plan JSON, returns a generated PDF.
- `POST /api/speech/transcribe` — audio → text (wraps Speech-to-Text).
- `POST /api/speech/synthesize` — text → audio (wraps Text-to-Speech).
- `GET /api/history` — user's past analyses (requires auth).

**Processing pipeline (inside `/api/analyze`)**
1. **Ingest** — store raw upload in Cloud Storage; if voice, transcribe first.
2. **Classify & extract** — Gemini multimodal call: identify document type, issuing authority, and extract raw structured fields (dates, amounts, names, case/reference numbers, contact info).
3. **Authenticity check** (see §4.4) — heuristic + cross-reference pass, produces a verdict + reasons.
4. **Fact-check** (see §4.5) — extracted factual claims checked against external sources.
5. **Plain-language rewrite** — Gemini turns structured data + verdicts into a short summary and ordered action steps, in the user's selected language.
6. **Persist** — save structured result to Firestore, log the pipeline run (without storing sensitive document content in logs) to Cloud Logging.
7. **Respond** — return JSON to frontend; PDF generated on demand from the same JSON so it's never out of sync.

### 3.3 Data model (Firestore, simplified)

```
users/{userId}
  submissions/{submissionId}
    createdAt
    inputType: "image" | "pdf" | "voice" | "text"
    documentType: string            // e.g. "eviction_notice"
    issuingAuthorityClaimed: string
    extractedFields: { ... }
    authenticity: { verdict, confidence, reasons: [] }
    factChecks: [ { claim, status, source } ]
    actionPlan: { summary, steps: [ { text, deadline, priority } ], contacts: [] }
    language: string
    pdfUrl: string (Cloud Storage signed URL)
```

---

## 4. Google / Gemini Services — What to use and why

| Service | Purpose | Scoring benefit |
|---|---|---|
| **Gemini API (Vertex AI, multimodal)** | Core reasoning: document OCR+understanding from images/PDFs, entity extraction, plain-language rewriting, translation, red-flag scam analysis | Problem alignment, Google services usage |
| **Cloud Run** | Hosting backend (and frontend if bundled) | Required deployment target |
| **Speech-to-Text API** | Voice question input | Google services usage, accessibility |
| **Text-to-Speech API** | Read-aloud of results | Accessibility |
| **Firebase Auth** | User accounts, so history persists per user | Security score |
| **Firestore** | Structured storage of submissions/results | Code quality, real data handling |
| **Cloud Storage** | Raw uploaded files, generated PDFs | Standard, secure file handling |
| **Secret Manager** | Store Gemini/API keys — never hardcoded | Security score |
| **Cloud Logging / Monitoring** | Structured logs, pipeline error tracking | Efficiency/observability signal |
| **Custom Search JSON API / Google Search grounding** | Fact-check claims and verify issuing authority is real | Verification feature, differentiator |
| **Gemini "grounding with Google Search" tool** (if available via Vertex AI) | Lets Gemini cite live web sources when checking facts, rather than relying only on its training data | Stronger, defensible fact-checking |

### 4.4 Authenticity / fraud-detection approach (realistic for 4 hours)

True forensic document verification is not feasible from a photo in a hackathon. Build a **defensible heuristic layer** instead, and be transparent in the UI that this is a risk-signal system, not a certified verdict:

- **Sender/domain cross-check** — extract claimed issuing authority and any contact email/website; check it against a small curated list of known official domains for common authorities (e.g. `irs.gov`, local `.gov` patterns) or via a search-grounded Gemini call ("is this a real government agency and does this contact info match their public listing?").
- **Classic scam-pattern detection** — prompt Gemini to flag known red flags: urgent threatening language, requests for payment via gift cards/crypto/wire transfer, mismatched sender name vs. signature, generic greetings on a supposedly personalized official letter, suspicious phone numbers/links.
- **Internal consistency check** — do the letter's own dates, amounts, and case numbers make sense together (e.g., due date before issue date is a red flag)?
- **AI-generated-text signal** — ask Gemini to self-assess linguistic patterns typical of AI-generated scam templates (generic phrasing, repeated boilerplate structures) as one more weighted signal, not a standalone verdict.
- Combine into a **verdict** (Verified / Use Caution / Likely Fraudulent) with the specific reasons listed — this transparency is itself a UX and trust feature.

### 4.5 Fact-checking approach

- Extract discrete factual claims from the document (amount owed, cited law/section, deadline, authority name).
- For claims checkable via public data (does this authority exist, is this the correct fee schedule, is this a real court), use Google Search grounding or Custom Search API to look up a corroborating or contradicting source.
- Tag each claim: **Verified** (source found supporting it), **Unverifiable** (no public source either way — common for personalized notices), **Contradicted** (public source disagrees).
- Never claim certainty the system doesn't have — "Unverifiable" is a valid and honest answer, and judges will likely value that honesty over false confidence.

---

## 5. UI/UX Guidelines

### 5.1 Visual direction
- **Modern, bright, high-contrast** — not a corporate/legal-gray aesthetic (that undermines the "make this approachable" mission). Think: friendly civic-tech product, not a government form.
- Suggested palette: a confident primary (e.g., a vivid blue or teal) for trust/action, a warm accent (amber/coral) for urgency states, a clean off-white or white background — avoid beige/cream defaults.
- Rounded cards, generous whitespace, large legible type (min 16px body, 1.5 line-height) — this is an accessibility requirement, not just style.
- Color-coded urgency: red/amber/green badges on action steps by priority — but **never rely on color alone**; pair every color with an icon and a text label (accessibility for colorblind users).

### 5.2 Key screens
1. **Upload/Input screen** — big, obvious drop zone + camera button + mic button + text box, one clear primary call-to-action.
2. **Processing screen** — show pipeline stages ("Reading document… Checking authenticity… Verifying facts…") so the wait feels transparent, not stuck.
3. **Results screen** — top: authenticity badge + one-line summary. Middle: ordered action steps with deadlines. Bottom: fact-check list (expandable) + "Download PDF" + "Read aloud" + language switch.
4. **History screen** (if time allows) — list of past submissions.

### 5.3 Accessibility requirements (graded by the platform — build these in from the start, not after)
- Semantic HTML (`<button>`, `<nav>`, headings in order — not styled `<div>`s).
- All interactive elements keyboard-reachable and have visible focus states.
- `alt` text on all icons/images; `aria-live` region on the processing screen so screen readers announce progress.
- Language selector actually changes output language, not just UI chrome.
- Read-aloud feature doubles as a core accessibility feature for low-literacy users, not just a nice-to-have.

---

## 6. Roadmap

### Phase 0 — Hackathon MVP (build in ~4 hours)
Priority order — build top to bottom, stop when time runs out, each layer should work end-to-end before adding the next:
1. Single input path working: **image upload → Gemini extraction → plain-language summary + action steps** (text output only).
2. Add **voice input** (Speech-to-Text) and **text input** as alternate entry points into the same pipeline.
3. Add **PDF export** of the action plan.
4. Add the **authenticity heuristic layer** (§4.4) with a visible verdict badge.
5. Add the **fact-check layer** (§4.5) — even a lightweight version (2–3 claims checked) is enough to demonstrate the concept.
6. Add **Firebase Auth + Firestore** persistence (turns it from a demo script into a real product).
7. Accessibility pass + a handful of unit/integration tests.
8. Deploy to Cloud Run, verify the live URL from a fresh incognito window, then submit.

If time runs out, cut in this order (last cut first): history screen → multi-language output → read-aloud → fact-check depth → authenticity depth. **Never cut**: the core input→summary→action-plan loop, the Cloud Run deployment, or accessibility basics — those are the highest-weighted, hardest-to-fake signals in the automated scoring.

### Phase 1 — Post-hackathon expansion (roadmap beyond the event)
- Broaden document coverage with a document-type taxonomy (government, legal, financial, medical-adjacent-but-non-diagnostic, insurance, employment) and per-type extraction templates.
- Real integrations with official public-records APIs per country/region for stronger authenticity verification.
- Community-sourced database of confirmed scam letter templates (crowdsourced + verified) to pattern-match against.
- Case tracking: reminders before deadlines, follow-up nudges.
- Partnerships with legal-aid nonprofits and libraries for real-world distribution.
- Formal accessibility audit (WCAG 2.1 AA conformance testing).

---

## 7. What You Need to Have/Provide Before Building

- **Google Cloud project** with billing enabled (Cloud Run, Vertex AI, and most APIs require it even within free-tier limits).
- **APIs enabled**: Vertex AI API (Gemini), Cloud Run API, Cloud Storage, Firestore, Speech-to-Text, Text-to-Speech, Secret Manager, Custom Search JSON API (get a Search Engine ID + API key from Programmable Search Engine).
- **Firebase project** linked to the same GCP project (for Auth + easy Firestore setup).
- **A Gemini API key or Vertex AI service account** — store in Secret Manager, never in code or `.env` committed to git.
- **GitHub repo created and set to public** (submission requirement) before you start, so you can push incrementally.
- **A short written project description** ready to paste into the submission platform (2–3 sentences: what it does, who it helps, what Google services it uses).
- Sample test documents to use during the demo (a mock eviction notice, a mock benefits letter, a mock scam text) — prepare 2–3 of these yourself ahead of time so your demo isn't dependent on finding a real document live.

---

## 8. Repository Structure

```
clarity-bridge/
├── README.md
├── .gitignore
├── .env.example
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── components/        # UploadZone, ResultCard, AuthenticityBadge, FactCheckList, LanguageSwitcher
│   │   ├── pages/              # Home, Processing, Results, History
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── assets/
│   └── public/
├── backend/
│   ├── package.json
│   ├── Dockerfile
│   ├── src/
│   │   ├── routes/              # analyze.js, pdf.js, speech.js, history.js
│   │   ├── services/
│   │   │   ├── gemini.service.js
│   │   │   ├── authenticity.service.js
│   │   │   ├── factcheck.service.js
│   │   │   ├── pdf.service.js
│   │   │   └── speech.service.js
│   │   ├── middleware/          # auth.js, errorHandler.js, validateUpload.js
│   │   ├── utils/
│   │   └── tests/               # unit + integration tests
│   └── config/
├── infra/
│   ├── deploy.sh                 # gcloud run deploy script
│   └── cloudbuild.yaml           # optional CI
└── docs/
    ├── architecture.md            # this document, or a link to it
    └── api-spec.md
```

---

## 9. Disclaimers to Include in the Product Itself

- "ClarityBridge helps you understand and act on documents — it is not a lawyer, accountant, or government agency, and does not replace professional legal or financial advice."
- "Authenticity and fact-check results are risk signals based on available information, not a guarantee. When in doubt, contact the issuing authority directly using contact details you find independently, not only those printed on the document."

These two lines matter for judging (responsible AI use is part of "Problem Statement Alignment" for a societal-benefit challenge) and for real-world safety.
