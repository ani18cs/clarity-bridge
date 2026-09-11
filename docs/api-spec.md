# ClarityBridge — API Specification

Base URL: `/api`

All mutating endpoints require an `Authorization: Bearer <Firebase_ID_Token>` header when Firebase Auth is enabled in the frontend.

---

### 1. Document Analysis
- **`POST /api/analyze`**
  - **Content-Type**: `multipart/form-data`
  - **Payload Parameters**:
    - `file` (optional, binary): Image (PNG, JPG, WEBP) or PDF file (up to 15MB)
    - `audio` (optional, binary): Audio file (WAV, MP3, WEBM)
    - `text` (optional, string): Pasted text content or description
    - `language` (optional, string): Target ISO language code (e.g. `en`, `es`, `fr`, `hi`, `zh`)
  - **Success Response (200 OK)**:
    ```json
    {
      "id": "sub_8f7b2c9a",
      "createdAt": "2026-09-11T12:00:00.000Z",
      "inputType": "image",
      "documentType": "eviction_notice",
      "issuingAuthorityClaimed": "City Housing Authority",
      "summary": "This is a 14-day notice to pay rent or vacate the premises by September 25, 2026.",
      "authenticity": {
        "verdict": "Verified",
        "confidence": 0.92,
        "reasons": [
          "Claimed entity matches official municipal housing domain patterns.",
          "Standard legal citation formatting matches state statutes.",
          "Internal timeline logic is consistent."
        ]
      },
      "factChecks": [
        {
          "claim": "City Housing Authority is located at 100 Civic Center Way.",
          "status": "Verified",
          "source": "https://housing.citygov.example.com",
          "notes": "Verified against public directory listings."
        }
      ],
      "actionPlan": {
        "summary": "Immediate action required before the 14-day deadline to avoid court filing.",
        "steps": [
          {
            "id": 1,
            "title": "Contact Housing Authority Ombudsman",
            "description": "Call or email to request a payment plan or emergency rental assistance.",
            "priority": "Urgent",
            "deadline": "2026-09-18",
            "contact": "(555) 019-2831"
          }
        ],
        "contacts": [
          {
            "name": "Housing Assistance Helpdesk",
            "phone": "(555) 019-2831",
            "email": "help@housing.citygov.example.com"
          }
        ]
      },
      "language": "en"
    }
    ```

---

### 2. PDF Action Plan Generation
- **`POST /api/pdf`**
  - **Content-Type**: `application/json`
  - **Body**: Analysis JSON object (same format as returned by `/api/analyze`)
  - **Success Response (200 OK)**:
    - Streams generated PDF with `Content-Type: application/pdf` or returns `{ "pdfUrl": "...", "downloadUrl": "..." }`.

---

### 3. Speech Synthesis (Text-to-Speech)
- **`POST /api/speech/synthesize`**
  - **Content-Type**: `application/json`
  - **Body**: `{ "text": "Plain language summary to read aloud...", "languageCode": "en-US" }`
  - **Success Response (200 OK)**:
    - Returns `{ "audioContent": "<base64_encoded_audio>", "mimeType": "audio/mp3" }` or binary stream.

---

### 4. Speech Transcription (Speech-to-Text)
- **`POST /api/speech/transcribe`**
  - **Content-Type**: `multipart/form-data`
  - **Body**: `audio` file
  - **Success Response (200 OK)**:
    - Returns `{ "transcript": "I received this letter yesterday regarding my benefits..." }`.

---

### 5. History Retrieval
- **`GET /api/history`**
  - **Headers**: `Authorization: Bearer <token>`
  - **Success Response (200 OK)**: List of user submissions with summaries, dates, and verdicts.
