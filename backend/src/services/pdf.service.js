const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const logger = require('../middleware/logger');

/**
 * Generates a clean, branded, high-contrast action plan PDF using pdf-lib
 */
async function generateActionPlanPdf(analysisData) {
  const startTime = Date.now();
  logger.pipelineStage('PDF_Generation_Start', {
    documentType: analysisData.documentType || 'document'
  });

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4 dimensions in points (width x height)
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Color Palette
  const primaryTeal = rgb(0.06, 0.46, 0.43); // #0f766e
  const textDark = rgb(0.09, 0.09, 0.11);    // #18181b
  const textMuted = rgb(0.40, 0.44, 0.52);   // #64748b
  const bgCard = rgb(0.96, 0.98, 0.98);      // Light teal/gray background
  const borderCol = rgb(0.85, 0.90, 0.90);
  const white = rgb(1.0, 1.0, 1.0);

  // Verdict Colors
  const verdict = analysisData.authenticity?.verdict || 'Verified';
  let verdictColor = rgb(0.06, 0.60, 0.40); // Green
  if (verdict === 'Likely Fraudulent') verdictColor = rgb(0.88, 0.20, 0.20); // Red
  else if (verdict === 'Use Caution') verdictColor = rgb(0.85, 0.55, 0.10);  // Amber

  let y = height - 50;

  // 1. Header & Brand Bar
  page.drawRectangle({
    x: 40,
    y: y - 10,
    width: width - 80,
    height: 48,
    color: primaryTeal
  });

  page.drawText('ClarityBridge', {
    x: 55,
    y: y + 15,
    size: 20,
    font: fontBold,
    color: white
  });

  page.drawText('Document Action Plan & Verification Report', {
    x: 55,
    y: y + 2,
    size: 10,
    font: fontRegular,
    color: rgb(0.85, 0.95, 0.95)
  });

  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  page.drawText(`Generated: ${dateStr}`, {
    x: width - 180,
    y: y + 15,
    size: 9,
    font: fontRegular,
    color: white
  });

  y -= 45;

  // 2. Document & Authenticity Summary Box
  page.drawRectangle({
    x: 40,
    y: y - 55,
    width: width - 80,
    height: 60,
    color: bgCard,
    borderColor: borderCol,
    borderWidth: 1
  });

  const docTypeLabel = (analysisData.documentType || 'Official Notice').replace(/_/g, ' ').toUpperCase();
  const authority = analysisData.issuingAuthorityClaimed || 'Official Sender';

  page.drawText(`DOCUMENT: ${docTypeLabel}`, {
    x: 55,
    y: y - 18,
    size: 11,
    font: fontBold,
    color: primaryTeal
  });

  page.drawText(`Claimed Authority: ${authority}`, {
    x: 55,
    y: y - 34,
    size: 10,
    font: fontRegular,
    color: textDark
  });

  // Authenticity Badge on the right
  page.drawRectangle({
    x: width - 185,
    y: y - 36,
    width: 130,
    height: 24,
    color: verdictColor
  });

  page.drawText(`VERDICT: ${verdict.toUpperCase()}`, {
    x: width - 175,
    y: y - 27,
    size: 9,
    font: fontBold,
    color: white
  });

  y -= 75;

  // 3. Plain Language Summary Section
  page.drawText('PLAIN-LANGUAGE SUMMARY', {
    x: 40,
    y: y,
    size: 12,
    font: fontBold,
    color: textDark
  });
  y -= 16;

  const summary = analysisData.summary || 'Summary unavailable.';
  const summaryLines = wrapText(summary, 75);
  for (const line of summaryLines.slice(0, 4)) {
    page.drawText(line, {
      x: 40,
      y: y,
      size: 10,
      font: fontRegular,
      color: textDark,
      lineHeight: 14
    });
    y -= 14;
  }

  y -= 15;

  // 4. Prioritized Action Steps
  page.drawText('REQUIRED ACTION PLAN (BY PRIORITY)', {
    x: 40,
    y: y,
    size: 12,
    font: fontBold,
    color: textDark
  });
  y -= 20;

  const steps = analysisData.actionPlan?.steps || [];
  for (const step of steps.slice(0, 5)) {
    if (y < 120) break; // Ensure room for contacts and footer

    // Priority color
    let pColor = rgb(0.1, 0.5, 0.8);
    if (step.priority === 'Urgent') pColor = rgb(0.85, 0.2, 0.2);
    else if (step.priority === 'High') pColor = rgb(0.85, 0.5, 0.1);

    // Step Item Box
    page.drawRectangle({
      x: 40,
      y: y - 48,
      width: width - 80,
      height: 52,
      color: white,
      borderColor: borderCol,
      borderWidth: 1
    });

    // Priority Tag
    page.drawRectangle({
      x: 50,
      y: y - 18,
      width: 55,
      height: 14,
      color: pColor
    });

    page.drawText((step.priority || 'STEP').toUpperCase(), {
      x: 54,
      y: y - 14,
      size: 7,
      font: fontBold,
      color: white
    });

    // Step Title & Deadline
    const titleText = `${step.id ? step.id + '. ' : ''}${step.title || 'Action Required'}`;
    page.drawText(truncate(titleText, 45), {
      x: 115,
      y: y - 14,
      size: 10,
      font: fontBold,
      color: textDark
    });

    if (step.deadline) {
      page.drawText(`Deadline: ${step.deadline}`, {
        x: width - 180,
        y: y - 14,
        size: 9,
        font: fontBold,
        color: rgb(0.8, 0.2, 0.2)
      });
    }

    // Step Description
    const desc = step.description || '';
    const descLines = wrapText(desc, 80);
    if (descLines[0]) {
      page.drawText(descLines[0], {
        x: 50,
        y: y - 32,
        size: 9,
        font: fontRegular,
        color: textDark
      });
    }
    if (step.contact) {
      page.drawText(`Contact: ${step.contact}`, {
        x: 50,
        y: y - 44,
        size: 8,
        font: fontOblique,
        color: primaryTeal
      });
    }

    y -= 60;
  }

  // 5. Verified Contacts Section
  const contacts = analysisData.actionPlan?.contacts || [];
  if (contacts.length > 0 && y > 110) {
    page.drawText('VERIFIED DIRECT CONTACTS', {
      x: 40,
      y: y,
      size: 11,
      font: fontBold,
      color: textDark
    });
    y -= 16;

    for (const c of contacts.slice(0, 2)) {
      const contactInfo = `${c.name || 'Helpdesk'}: ${c.phone ? 'Phone: ' + c.phone : ''} ${c.email ? 'Email: ' + c.email : ''} ${c.website || ''}`;
      page.drawText(`• ${truncate(contactInfo.trim(), 80)}`, {
        x: 50,
        y: y,
        size: 9,
        font: fontRegular,
        color: textDark
      });
      y -= 13;
    }
    y -= 10;
  }

  // 6. Disclaimer Footer (Required by Challenge)
  const disclaimerBoxY = 40;
  page.drawRectangle({
    x: 40,
    y: disclaimerBoxY,
    width: width - 80,
    height: 38,
    color: rgb(0.97, 0.97, 0.98),
    borderColor: rgb(0.90, 0.90, 0.92),
    borderWidth: 1
  });

  const disclaimer1 = 'ClarityBridge helps you understand and act on documents — it is not a lawyer, accountant, or government agency,';
  const disclaimer2 = 'and does not replace professional legal or financial advice. Authenticity and fact-check results are risk signals, not a guarantee.';

  page.drawText(disclaimer1, {
    x: 48,
    y: disclaimerBoxY + 22,
    size: 7,
    font: fontRegular,
    color: textMuted
  });

  page.drawText(disclaimer2, {
    x: 48,
    y: disclaimerBoxY + 11,
    size: 7,
    font: fontRegular,
    color: textMuted
  });

  const pdfBytes = await pdfDoc.save();
  logger.pipelineStage('PDF_Generation_Complete', {
    durationMs: Date.now() - startTime,
    byteSize: pdfBytes.length
  });

  return Buffer.from(pdfBytes);
}

function wrapText(text, maxChars) {
  if (!text) return [];
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function truncate(str, maxLen) {
  if (!str) return '';
  return str.length > maxLen ? str.substring(0, maxLen - 3) + '...' : str;
}

module.exports = {
  generateActionPlanPdf,
  wrapText,
  truncate
};
