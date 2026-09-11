# ClarityBridge Security Architecture & Threat Model

**ClarityBridge** is engineered as a secure, zero-cost, privacy-first document intelligence platform. Security, user privacy, and data isolation are integrated into every architectural layer in strict alignment with the **OWASP Top 10 for LLM Applications (2026)** and the **NIST AI Risk Management Framework (NIST AI RMF 1.0)**.

---

## 1. OWASP Top 10 for LLM Applications (2026) Compliance

| OWASP LLM Risk | Threat Vector | ClarityBridge Defense & Architectural Guardrail |
| :--- | :--- | :--- |
| **LLM01: Prompt Injection** | Adversarial text hidden inside uploaded PDF, photo, or pasted document attempting to override system prompts or execute malicious instructions. | **Delimited Data Boundaries & Zero Execution Directive**:<br>• All user-supplied text and OCR extractions are treated as untrusted data and wrapped in explicit delimiters (`<<<UNTRUSTED_DOCUMENT_DATA_START>>>` ... `<<<UNTRUSTED_DOCUMENT_DATA_END>>>`).<br>• System prompts strictly instruct the model to analyze data passively and never execute embedded commands.<br>• **Post-Processing Schema Enforcement**: Model outputs that deviate from strict JSON schema are rejected and handed off to deterministic semantic parsers. |
| **LLM02: Sensitive Information Disclosure** | Accidental leakage of personally identifiable information (PII, PAN, Aadhaar, SSN, bank accounts) in logs, shared links, or community databases. | **Multi-Layer PII Protection & Scrubbing**:<br>• **Zero-PII Cloud Logging**: Structured logger automatically purges `text`, `rawText`, `content`, `email`, and `phone` before emitting logs.<br>• **Pre-Storage PII Scrubber**: Before any pattern is written to the shared `scamPatterns` collection, an automated regex engine redacts Indian PAN, Aadhaar, phone numbers, emails, credit cards, and bank accounts.<br>• Cloud Storage buckets enforce Uniform Bucket-Level Access and generate short-lived signed URLs (24h expiry). |
| **LLM03: Supply Chain Vulnerabilities** | Compromised third-party packages or transitively floating dependencies. | **Pinned Dependencies & Audit Verification**:<br>• Every security-relevant dependency is pinned to an exact version in `backend/package.json` (no floating `^` ranges).<br>• Regular automated scans via `npm audit` prior to any Cloud Run deployment. |
| **LLM04: Data and Model Poisoning** | Model contamination or malicious external fine-tuning vectors. | Pure zero-shot multimodal inference on Google Vertex AI / Gemini 2.5 Flash without persistent fine-tuning or retention of document training sets. |
| **LLM05: Improper Output Handling** | Malicious script tags or payload reflection from parsed documents leading to Cross-Site Scripting (XSS). | **Safe DOM Text Binding**:<br>• All output fields, summaries, and action steps are rendered through standard React text nodes (`{summary}`, `{step.description}`).<br>• Absolute prohibition of `dangerouslySetInnerHTML` across the entire frontend codebase. |
| **LLM06: Excessive Agency** | Autonomous action execution, unauthorized external calls, or automated government complaint filing. | **Strict Human-in-the-Loop Architecture**:<br>• ClarityBridge is strictly an advisory, triage, and drafting tool.<br>• **Zero Automated Submissions**: Fraud reporting aids draft complaint text only; citizens must manually submit on official portals ([cybercrime.gov.in](https://cybercrime.gov.in), [sachet.rbi.org.in](https://sachet.rbi.org.in)). Zero automated third-party form submissions. |
| **LLM07: System Prompt Leakage** | Extraction of internal system instructions through adversarial conversational queries. | System prompt isolation with separate execution scopes and strict structured JSON responses. |
| **LLM08: Vector and Embedding Weaknesses** | Vector store poisoning or similarity injection. | Fact-checking queries utilize validated search parameters and verified institutional domain constraints. |
| **LLM09: Misinformation & Hallucinations** | False categorizations or invented legal consequences. | **Strict Anti-Hallucination Guardrails**:<br>• Government notices require verified statutory / agency markers.<br>• Ambiguous/general documents default to honest topic summaries without jumping to false official conclusions. |
| **LLM10: Unbounded Consumption** | Denial of service / resource exhaustion through massive files or API spamming. | **Pre-Processing Upload Limits & Rate Limiting**:<br>• 15MB file size limit enforced before memory buffers are processed.<br>• Strict MIME type filtering (Images & PDFs only).<br>• Per-user rate limiting (30 requests per 15 min) via `express-rate-limit`. |

---

## 2. PII Scrubber & Shared Community Pool Security

ClarityBridge maintains a shared community scam database (`scamPatterns` collection in Cloud Firestore) to protect users from emerging fraud campaigns. To uphold privacy:

1. **Mandatory PII Scrubber**:
   - Before writing any user-contributed pattern, `backend/src/utils/piiScrubber.js` applies regular expression rules that redact:
     - **Indian PAN**: `[REDACTED_PAN]` (e.g. `ABCDE1234F`)
     - **Indian Aadhaar**: `[REDACTED_AADHAAR]` (e.g. `1234 5678 9012`)
     - **Email Addresses**: `[REDACTED_EMAIL]`
     - **Phone Numbers**: `[REDACTED_PHONE]` (e.g. `+91 9876543210`, `(555) 123-4567`)
     - **Credit Card Numbers**: `[REDACTED_CARD]`
     - **Bank Account Numbers**: `[REDACTED_ACCOUNT]`
2. **Zero Raw File Ingestion**:
   - Original document scans, photos, PDFs, and user account IDs are **NEVER saved or shared** to the community scam pool.
   - Only anonymized threat keywords, claimed authority names, and requested payment channels are stored.
3. **Data-Scope Disclosure**:
   - Users must explicitly confirm contributions via an interactive modal with full privacy disclosures.

---

## 3. Scoped 7-Day Shareable Result Links

The result-sharing feature (`/api/share`) is architected with strict security boundaries:

- **Random Unguessable Tokens**: Share links use random 16-character hex tokens (`CB-<token>`), preventing enumeration attacks.
- **7-Day Time-To-Live (TTL)**: Links automatically expire 7 days after creation (`expiresAt`). Expired tokens return `410 LinkExpired`.
- **Read-Only Scoped Payload**: The shared view returns only the sanitized document analysis (summary, action plan, authenticity signals, fact checks). Internal user IDs, session tokens, and Cloud Storage paths are completely stripped.
- **Isolation Guarantee**: Accessing a shared link does not authenticate the recipient or grant access to any other document in the sender's account.
- **Civic Attribution**: Every shared link prominently includes a civic disclaimer to ensure the recipient understands the advisory nature of the report.

---

## 4. Application Security Controls

### Secret Management & Runtime Credentials
- **Google Cloud Secret Manager**: All API keys (`GEMINI_API_KEY`, `CUSTOM_SEARCH_API_KEY`) are dynamically resolved at runtime from Secret Manager in GCP environments.
- **Zero Committed Secrets**: `.env` files are strictly excluded from version control via `.gitignore`. A sanitized `.env.example` is provided for local development.

### Authentication & Authorization
- **Firebase Authentication**: State-changing endpoints verify Firebase ID tokens server-side on every request using `firebase-admin`.
- **Object-Level Authorization**: Firestore document reads and Cloud Storage objects are strictly partitioned by `userId`. Users cannot query, view, or download other users' submission records or files.

### Network & Transport Security
- **Helmet**: Enforces modern security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`).
- **CORS Allow-List**: Strict origin allow-list restricting cross-origin resource sharing to authorized production domains and local development ports.
- **Rate Limiting**: Rate limiter prevents API quota exhaustion and denial-of-service abuse.

---

## 5. Civic & Advisory Disclaimer

> **IMPORTANT CIVIC NOTICE**:
> ClarityBridge is an assistive triage, translation, and document comprehension tool. It does **not** provide legal, financial, tax, or government advice. Authenticity verdicts and fact-checking assessments are risk indicators and decision-support aids, not legal guarantees. Users should verify critical legal matters with authorized attorneys or official government agencies.

---

## 6. Vulnerability Disclosure & Audit Protocol

Before every production release:
1. Run `npm audit` across `backend/` and `frontend/` to ensure zero critical or high vulnerabilities.
2. Run the complete test suite (`npm test` in `backend/`) to verify all 39 unit, integration, and security tests pass.
3. Verify that all Cloud Run environment variables reference Google Cloud Secret Manager.
