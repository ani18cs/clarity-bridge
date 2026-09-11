/**
 * ClarityBridge Server-Rendered HTML Print Template for PDF Export
 * Reuses identical CSS custom properties, fonts, colors, borders, and badge tokens from the web UI.
 */

function generatePdfHtml(analysisData = {}) {
  const docType = (analysisData.documentType || 'Official Notice').replace(/_/g, ' ').toUpperCase();
  const authority = analysisData.issuingAuthorityClaimed || 'Official Authority';
  const summary = analysisData.summary || 'Summary unavailable.';
  const fields = analysisData.extractedFields || {};
  const steps = analysisData.actionPlan?.steps || [];
  const contacts = analysisData.actionPlan?.contacts || [];
  const signals = analysisData.authenticity?.itemizedSignals || [];
  const verdict = analysisData.authenticity?.verdict || 'Verified';
  const confidence = Math.round((analysisData.authenticity?.confidence || 0.85) * 100);

  // Verdict Colors
  let verdictBg = '#DFF7EC';
  let verdictText = '#0f766e';
  let verdictBorder = '#2FBF86';
  let stampBadgeText = 'VERIFIED';
  let stampBadgeClass = 'stamp-grass';

  if (verdict === 'Likely Fraudulent') {
    verdictBg = '#FFE3E1';
    verdictText = '#991b1b';
    verdictBorder = '#FF5C5C';
    stampBadgeText = 'LIKELY\nFRAUD';
    stampBadgeClass = 'stamp-coral';
  } else if (verdict === 'Use Caution') {
    verdictBg = '#FFF3D6';
    verdictText = '#92400e';
    verdictBorder = '#FFB238';
    stampBadgeText = 'USE\nCAUTION';
    stampBadgeClass = 'stamp-marigold';
  } else if (verdict === 'Needs Manual Review') {
    verdictBg = '#E7E5FF';
    verdictText = '#3730a3';
    verdictBorder = '#5B5FEF';
    stampBadgeText = 'NEEDS\nREVIEW';
    stampBadgeClass = 'stamp-periwinkle';
  }

  // Format today's date in Indian DD/MM/YYYY format
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  const dateFormatted = `${day}/${month}/${year}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ClarityBridge Action Plan — ${docType}</title>
  <!-- Google Fonts for English and Indic Languages -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&family=Noto+Sans+Tamil:wght@400;600;700&family=Noto+Sans+Telugu:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm 14mm 15mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', 'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans Bengali', 'Noto Sans Telugu', sans-serif;
      background-color: #ffffff;
      color: #1C1B2E;
      font-size: 11px;
      line-height: 1.45;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    h1, h2, h3, h4, .font-display {
      font-family: 'Baloo 2', 'Noto Sans Devanagari', sans-serif;
      font-weight: 800;
      color: #1C1B2E;
    }

    .no-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      background-color: #5B5FEF;
      color: #ffffff;
      border: 2.5px solid #1C1B2E;
      border-radius: 12px;
      box-shadow: 4px 4px 0px #1C1B2E;
      margin-bottom: 12px;
    }

    .header-title {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.2px;
      color: #ffffff;
    }

    .header-sub {
      font-size: 9px;
      color: #E7E5FF;
      font-weight: 600;
    }

    .doc-info-card {
      background-color: #F5F3FF;
      border: 2px solid #1C1B2E;
      border-radius: 12px;
      padding: 10px 14px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 3px 3px 0px #1C1B2E;
    }

    .stamp-badge {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 2.5px double #1C1B2E;
      font-weight: 800;
      font-size: 10px;
      text-align: center;
      line-height: 1.1;
      transform: rotate(-6deg);
      box-shadow: 2px 2px 0px #1C1B2E;
      flex-shrink: 0;
    }

    .stamp-grass { background-color: #DFF7EC; color: #0f766e; }
    .stamp-marigold { background-color: #FFF3D6; color: #92400e; }
    .stamp-coral { background-color: #FFE3E1; color: #991b1b; }
    .stamp-periwinkle { background-color: #E7E5FF; color: #3730a3; }

    .verdict-box {
      border: 2.5px solid #1C1B2E;
      border-radius: 12px;
      padding: 12px 14px;
      background-color: ${verdictBg};
      margin-bottom: 12px;
      box-shadow: 4px 4px 0px #1C1B2E;
      display: flex;
      gap: 14px;
      align-items: center;
    }

    .card-section {
      background-color: #ffffff;
      border: 2px solid #1C1B2E;
      border-radius: 12px;
      padding: 12px 14px;
      margin-bottom: 12px;
      box-shadow: 3px 3px 0px #1C1B2E;
    }

    .step-card {
      background-color: #ffffff;
      border: 2px solid #1C1B2E;
      border-radius: 10px;
      padding: 10px 12px;
      margin-bottom: 8px;
      box-shadow: 2px 2px 0px #1C1B2E;
      position: relative;
    }

    .priority-pill {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      border: 1px solid #1C1B2E;
      font-size: 8px;
      font-weight: 800;
      text-transform: uppercase;
      color: #ffffff;
      margin-right: 6px;
    }

    .p-urgent { background-color: #FF5C5C; }
    .p-high { background-color: #FFB238; color: #1C1B2E; }
    .p-medium { background-color: #5B5FEF; }
    .p-low, .p-info { background-color: #2FBF86; }

    .signals-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin-top: 8px;
    }

    .signal-item {
      padding: 6px 8px;
      border: 1.5px solid #1C1B2E;
      border-radius: 8px;
      font-size: 9px;
      background-color: #ffffff;
    }

    .signal-item.suspicious { background-color: #FFE3E1; }
    .signal-item.safe { background-color: #DFF7EC; }

    .disclaimer-box {
      border: 1.5px dashed #1C1B2E;
      border-radius: 10px;
      padding: 8px 12px;
      background-color: #F5F3FF;
      font-size: 8px;
      color: #454264;
      line-height: 1.35;
      margin-top: 10px;
    }
  </style>
</head>
<body>

  <!-- Top Header & Brand Bar -->
  <div class="header-bar no-break">
    <div>
      <div class="header-title">ClarityBridge</div>
      <div class="header-sub">Universal Document Intelligence & Action Plan Report</div>
    </div>
    <div style="text-align: right; font-size: 9px; font-weight: 700;">
      <div>Date: ${dateFormatted}</div>
      <div style="opacity: 0.85;">Currency: ₹ (INR)</div>
    </div>
  </div>

  <!-- Document Metadata Card -->
  <div class="doc-info-card no-break">
    <div>
      <div style="font-size: 8px; font-weight: 800; text-transform: uppercase; color: #5B5FEF;">Document Type</div>
      <div style="font-size: 13px; font-weight: 800;">${docType}</div>
      <div style="font-size: 10px; color: #454264; margin-top: 2px;">Claimed Authority: <strong>${authority}</strong></div>
    </div>
    <div style="text-align: right; font-size: 9px;">
      ${fields.din?.value ? `<div><strong>DIN:</strong> ${fields.din.value}</div>` : ''}
      ${fields.pan?.value ? `<div><strong>PAN:</strong> ${fields.pan.value}</div>` : ''}
      ${fields.gstin?.value ? `<div><strong>GSTIN:</strong> ${fields.gstin.value}</div>` : ''}
      ${fields.aadhaar?.value ? `<div><strong>Aadhaar:</strong> ${fields.aadhaar.value}</div>` : ''}
      ${fields.amountDue?.value ? `<div><strong>Amount:</strong> ${fields.amountDue.value}</div>` : ''}
    </div>
  </div>

  <!-- Authenticity Verdict Banner & Stamp -->
  <div class="verdict-box no-break">
    <div class="stamp-badge ${stampBadgeClass}">
      <div>${stampBadgeText.replace('\n', '<br>')}</div>
      <div style="font-size: 8px; font-weight: 600; opacity: 0.85; margin-top: 2px;">${confidence}% Signal</div>
    </div>
    <div style="flex: 1;">
      <div style="font-size: 8px; font-weight: 800; text-transform: uppercase; opacity: 0.8;">Authenticity & Risk Assessment</div>
      <h3 style="font-size: 14px; margin-bottom: 2px;">Verdict: ${verdict.toUpperCase()}</h3>
      <p style="font-size: 9.5px; line-height: 1.35; color: #1C1B2E;">
        ${analysisData.authenticity?.reasons?.[0] || 'Evaluated across authority domains, statutory DIN/GSTIN checks, and community fraud patterns.'}
      </p>
    </div>
  </div>

  <!-- Document Parties & Subject -->
  ${(fields.senderClientName?.value || fields.recipientName?.value || fields.underlyingAgreement?.value) ? `
  <div class="card-section no-break" style="background-color: #FFFDF5; border-color: #FACC15;">
    <h3 style="font-size: 11px; margin-bottom: 6px; color: #854d0e;">Document Parties & Legal Reference</h3>
    <div style="font-size: 9px; line-height: 1.4;">
      ${fields.senderClientName?.value ? `<div style="margin-bottom: 3px;"><strong>Issued On Behalf Of (Client / Sender):</strong> ${fields.senderClientName.value} ${fields.senderClientAddress?.value ? `(${fields.senderClientAddress.value})` : ''}</div>` : ''}
      ${fields.recipientName?.value ? `<div style="margin-bottom: 3px;"><strong>Addressed To (Recipient):</strong> ${fields.recipientName.value} ${fields.recipientAddress?.value ? `(${fields.recipientAddress.value})` : ''}</div>` : ''}
      ${fields.underlyingAgreement?.value ? `<div style="margin-bottom: 3px;"><strong>Underlying Agreement / Matter in Dispute:</strong> ${fields.underlyingAgreement.value}</div>` : ''}
    </div>
  </div>
  ` : ''}

  <!-- Plain Language Summary -->
  <div class="card-section no-break">
    <h3 style="font-size: 12px; margin-bottom: 4px; color: #5B5FEF;">Plain-Language Translation</h3>
    <p style="font-size: 10px; line-height: 1.45; color: #1C1B2E;">
      ${summary}
    </p>
  </div>

  <!-- Legal Implications ("What This Means For You") -->
  ${analysisData.legalImplications && analysisData.legalImplications.length > 0 ? `
  <div class="card-section no-break" style="background-color: #FFF5F5; border-color: #FF5C5C;">
    <h3 style="font-size: 11px; margin-bottom: 4px; color: #991b1b;">What This Means For You (Legal & Financial Risks)</h3>
    <div style="font-size: 9px; line-height: 1.4;">
      ${analysisData.legalImplications.slice(0, 3).map(imp => `
        <div style="margin-bottom: 4px;">
          <strong>• ${imp.risk} [${imp.severity || 'Caution'} Risk]:</strong> ${imp.consequence}
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <!-- Citizen Rights & Statutory Protections -->
  ${analysisData.citizenRights && analysisData.citizenRights.length > 0 ? `
  <div class="card-section no-break" style="background-color: #F2FCF7; border-color: #2FBF86;">
    <h3 style="font-size: 11px; margin-bottom: 4px; color: #0f766e;">Your Statutory Rights & Legal Protections</h3>
    <div style="font-size: 9px; line-height: 1.4;">
      ${analysisData.citizenRights.slice(0, 3).map(rt => `
        <div style="margin-bottom: 4px;">
          <strong>• ${rt.right}:</strong> ${rt.remedy} ${rt.statute ? `<em>(${rt.statute})</em>` : ''}
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <!-- Legalese Demystifier -->
  ${analysisData.jargonDemystified && analysisData.jargonDemystified.length > 0 ? `
  <div class="card-section no-break" style="background-color: #F5F3FF; border-color: #5B5FEF;">
    <h3 style="font-size: 11px; margin-bottom: 4px; color: #5B5FEF;">Key Legal & Statutory Terms Explained</h3>
    <div style="font-size: 8.5px; line-height: 1.35;">
      ${analysisData.jargonDemystified.slice(0, 3).map(jg => `
        <div style="margin-bottom: 3px;">
          <strong>📖 ${jg.term}:</strong> ${jg.meaning}
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <!-- Itemized Transparency Signals (Why This Verdict?) -->
  ${signals.length > 0 ? `
  <div class="card-section no-break">
    <h3 style="font-size: 11px; margin-bottom: 4px;">Itemized Transparency Signals</h3>
    <div class="signals-grid">
      ${signals.slice(0, 4).map(s => `
        <div class="signal-item ${s.direction === 'indicates_suspicion' ? 'suspicious' : 'safe'}">
          <div style="font-weight: 700;">${s.name}</div>
          <div style="font-size: 8px; opacity: 0.85; margin-top: 1px;">${s.explanation}</div>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <!-- Prioritized Action Plan -->
  <div style="margin-bottom: 12px;">
    <h3 style="font-size: 12px; margin-bottom: 6px;">Prioritized Action Plan Steps</h3>
    ${steps.slice(0, 5).map((step, idx) => {
      let pClass = 'p-medium';
      const pLower = (step.priority || '').toLowerCase();
      if (pLower.includes('urgent')) pClass = 'p-urgent';
      else if (pLower.includes('high')) pClass = 'p-high';
      else if (pLower.includes('low')) pClass = 'p-low';
      else if (pLower.includes('info')) pClass = 'p-info';

      return `
      <div class="step-card no-break">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px;">
          <div>
            <span class="priority-pill ${pClass}">${step.priority || 'STEP'}</span>
            <strong style="font-size: 10px;">${idx + 1}. ${step.title || 'Action Required'}</strong>
          </div>
          ${step.deadline ? `<span style="font-size: 8.5px; font-weight: 700; color: #FF5C5C;">Deadline: ${step.deadline}</span>` : ''}
        </div>
        <div style="font-size: 9px; color: #1C1B2E; margin-top: 2px;">${step.description || ''}</div>
        ${step.contact ? `<div style="font-size: 8px; color: #5B5FEF; font-weight: 600; margin-top: 2px;">Contact: ${step.contact}</div>` : ''}
      </div>
      `;
    }).join('')}
  </div>

  <!-- Verified Directory Contacts -->
  ${contacts.length > 0 ? `
  <div class="card-section no-break" style="padding: 8px 12px;">
    <h4 style="font-size: 10px; margin-bottom: 2px;">Verified Direct Authority Contacts</h4>
    <div style="font-size: 8.5px; color: #454264;">
      ${contacts.slice(0, 2).map(c => `
        • <strong>${c.name || 'Helpdesk'}:</strong> ${c.phone ? 'Phone: ' + c.phone : ''} ${c.email ? 'Email: ' + c.email : ''} ${c.website ? 'Portal: ' + c.website : ''}
      `).join('<br>')}
    </div>
  </div>
  ` : ''}

  <!-- DPDP Act 2023 Civic Disclaimer Footer -->
  <div class="disclaimer-box no-break">
    <strong>DPDP Act 2023 & Civic Advisory Notice:</strong>
    ClarityBridge is an assistive triage and comprehension tool — it is not a lawyer, chartered accountant, or government body. All uploaded data is handled in strict compliance with the Digital Personal Data Protection (DPDP) Act 2023 with zero persistent raw PII retention. Authenticity assessments are risk indicators, not legal guarantees. Always verify statutory notices directly on official portals (incometax.gov.in, gst.gov.in, sachet.rbi.org.in, cybercrime.gov.in - 1930 Helpline).
  </div>

</body>
</html>`;
}

module.exports = {
  generatePdfHtml
};
