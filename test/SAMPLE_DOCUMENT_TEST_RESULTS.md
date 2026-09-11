# ClarityBridge — Sample Document Test Results & Grounded Extraction Evaluation

This document presents empirical test results across 5 distinct categories of real-world Indian legal, civic, and fraudulent documents processed by **ClarityBridge**.

---

## 📑 Test Case 1: Advocate Legal Notice (Land / Satakhat Contract Breach)

### 1. Document Overview & Metadata
- **Document Title / Type**: Advocate Legal Notice (*Satakhat Agreement Breach & Demand*)
- **Reference Identifier**: `Ref: JD/101/2015`
- **Notice Date**: `16 September 2015`
- **Delivery Mode**: `By Registered Post A.D. / Speed Post`
- **Legal Precaution**: `Without Prejudice`
- **Language Mode Tested**: English, Gujarati (`ગુજરાતી`), and Hindi (`हिन्दी`)

### 2. Extracted Parties & Grounded Facts
| Extracted Field | Extracted Entity Value | Confidence | Grounding Status |
|---|---|---|---|
| **Addressed To (Recipient)** | `Soni Jaysukhlal Shantilal` | 98% (High) | Verified directly from recipient line |
| **Recipient Address** | `At & Post: Dhari, Dist: Amreli (Gujarat)` | 95% (High) | Matched from postal address block |
| **Issued On Behalf Of (Client / Sender)** | `Shree Jagjivanbhai Lakshmanbhai Umaralia` | 98% (High) | Matched from client authorization clause |
| **Client / Sender Address** | `Residing at: Surat (Gujarat)` | 95% (High) | Matched from client domicile details |
| **Underlying Agreement in Dispute** | `Satakhat (Agreement to Sell) Land Sale Agreement dated 14/08/2014` | 96% (High) | Matched from agreement reference clause |
| **Subject of Notice** | `Breach of Satakhat terms and failure to execute registered sale deed` | 94% (High) | Matched from subject line |

### 3. Multilingual Plain-Language Summaries
- **English Output**:
  > *"This is a formal Advocate Legal Notice issued on behalf of Shree Jagjivanbhai Lakshmanbhai Umaralia to Soni Jaysukhlal Shantilal (Ref: JD/101/2015) dated 16 September 2015. The notice concerns the alleged breach of the Satakhat Land Sale Agreement dated 14/08/2014. The client alleges willful non-performance, breach of trust, and fraud, and formally calls upon the recipient to fulfill the agreement terms immediately, failing which civil litigation (Specific Performance & damages) and criminal proceedings will be initiated."*
- **Gujarati Output (ગુજરાતી)**:
  > *"આ એક ઔપચારિક વકીલ કાનૂની નોટિસ છે જે Shree Jagjivanbhai Lakshmanbhai Umaralia વતી Soni Jaysukhlal Shantilal ને મોકલવામાં આવી છે (સંદર્ભ ક્રમાંક: Ref: JD/101/2015). આ નોટિસ 'Satakhat Land Sale Agreement dated 14/08/2014' ના કથિત ઉલ્લંઘન અને વિવાદ અંગે છે. અરજદારનો આક્ષેપ છે કે કરારની શરતોનું ઇરાદાપૂર્વક ઉલ્લંઘન કરવામાં આવ્યું છે, જેના પરિણામે વિશ્વાસઘાત અને છેતરપિંડી થઈ છે. નોટિસમાં તાકીદે શરતોનું પાલન કરવાની માંગ કરવામાં આવી છે, અન્યથા સિવિલ કોર્ટમાં દાવો (વિશિષ્ટ પાલન/નુકસાની) અથવા ફોજદારી કાર્યવાહી શરૂ કરવામાં આવશે."*
- **Hindi Output (हिन्दी)**:
  > *"यह एक औपचारिक वकील कानूनी नोटिस है जो Shree Jagjivanbhai Lakshmanbhai Umaralia की ओर से Soni Jaysukhlal Shantilal को भेजा गया है (संदर्भ: Ref: JD/101/2015)। यह नोटिस 'Satakhat Land Sale Agreement dated 14/08/2014' के कथित उल्लंघन और विवाद से संबंधित है। प्रेषक का आरोप है कि समझौते की शर्तों का जानबूझकर उल्लंघन किया गया है, जिसके परिणामस्वरूप विश्वासघात और धोखाधड़ी हुई है। इसमें मांग की गई है कि शर्तों का तुरंत पालन किया जाए, अन्यथा सिविल मुकदमा (विशिष्ट निष्पादन और हर्जाने हेतु) या आपराधिक कार्यवाही शुरू की जाएगी।"*

### 4. Legal Implications & Citizen Defenses
- **Litigation Risks Identified**:
  1. *Civil Suit for Specific Performance*: Risk of court injunction or decree forcing completion of sale or heavy financial compensation.
  2. *Criminal Breach of Trust (BNS)*: Potential police complaint if fraudulent intent is alleged.
  3. *Adverse Inference*: Silence or failure to reply within 15 days can be used against recipient in court.
- **Citizen Statutory Rights**:
  1. *Right to File Formal Reply Notice u/s CPC*: Disputing incorrect allegations through an advocate.
  2. *Right to Pre-Litigation Mediation*: Under the *Mediation Act, 2023*.
  3. *Right of Fair Defense*: Notice is an assertion, not a court verdict; ex-parte orders cannot be passed without judicial summons.

### 5. Verification Verdict
- **Verdict**: `Verified (Authentic Legal Notice)`
- **Confidence**: `0.92`
- **Red Flags**: `0 detected`

---

## 📑 Test Case 2: Income Tax Demand Notice u/s 156 (Authentic)

### 1. Document Inputs
- **Document Identification Number (DIN)**: `ITBA/AST/S/156/2026-27/104829104859`
- **Assessment Year**: `2025-26`
- **Demand Amount**: `₹18,450`
- **Compliance Window**: `30 days`

### 2. System Analysis & Verification
- **DIN Validation**: `Valid` (Matches CBDT Circular 19/2019 statutory format).
- **Official Payment Channel**: Directs user to `https://eportal.incometax.gov.in` (Official GOV domain).
- **Statutory Remedy**: Explains citizen's right to file an online Rectification Request u/s 154 or appeal to CIT(Appeals) in Form 35 within 30 days.
- **Verdict**: `Verified` (Confidence: 0.95).

---

## 📑 Test Case 3: Fake ITD Arrest Summons Extortion (Fraudulent)

### 1. Document Inputs
- **Claimed Issuer**: *"Central Income Tax Recovery Police Force"* (Non-existent bogus entity)
- **Coercive Demand**: Threats of immediate arrest within 2 hours.
- **Payment Method Demanded**: Google Play Gift Cards / Apple Cards / personal UPI ID `tax-settlement-officer@upi`.
- **Instruction**: *"DO NOT CONTACT LAWYER OR LOCAL POLICE"*.

### 2. System Analysis & Verification
- **Fraud Classification**: `Likely Fraudulent (High Risk)`
- **Red Flags Detected (4 independent signals)**:
  1. 🚨 *Bogus Agency*: Income tax department has no "Recovery Police Force".
  2. 🚨 *Gift Card / UPI Scam*: Tax demands cannot be paid via gift cards or personal UPI IDs.
  3. 🚨 *Isolation Tactic*: Instructing victim not to consult lawyers is a classic social engineering pattern.
  4. 🚨 *Missing DIN*: Document lacks statutory 20-digit ITD DIN.
- **Citizen Assist Triggered**:
  - Auto-generated pre-filled complaint draft for the **National Cyber Crime Reporting Portal** ([cybercrime.gov.in](https://cybercrime.gov.in)) & **Helpline 1930**.

---

## 📑 Test Case 4: Cheque Bounce Notice u/s 138 NI Act (Legal)

### 1. Document Inputs
- **Statutory Provision**: Section 138 of Negotiable Instruments Act, 1881.
- **Dishonoured Cheque Amount**: `₹2,50,000`.
- **Statutory Notice Period**: `15 days from receipt`.

### 2. System Analysis & Verification
- **Statutory Clock**: Explains that citizen has a non-negotiable **15-day statutory cure period** to settle the amount before criminal complaint can be filed before a Judicial Magistrate.
- **Action Plan**: Advises verifying bank return memo reason (*"Funds Insufficient"* vs *"Signature Mismatch"*) and preparing a lawyer-assisted reply.
- **Verdict**: `Verified` (Confidence: 0.91).

---

## 📑 Test Case 5: State Electricity Disconnection Notice u/s 56(1) (Utility)

### 1. Document Inputs
- **Issuing Body**: Maharashtra State Electricity Distribution Co. Ltd. (MSEDCL)
- **Consumer Number**: `019284729102`
- **Overdue Bill Amount**: `₹3,420.00`
- **Notice Period**: `15 days`

### 2. System Analysis & Verification
- **Statutory Protection**: Section 56(1) of Electricity Act, 2003 mandates 15 days notice before disconnection.
- **Remedies**: Outlines direct payment via official portal (`mahadiscom.in`) and right to approach the Consumer Grievance Redressal Forum (CGRF).
- **Verdict**: `Verified` (Confidence: 0.94).
