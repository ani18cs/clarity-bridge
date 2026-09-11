let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch (e) {
  puppeteer = null;
}
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const logger = require('../middleware/logger');
const { generatePdfHtml } = require('../templates/pdfTemplate');

/**
 * Generates a pixel-perfect, branded action plan PDF using Puppeteer Headless Chromium
 * with identical styling, ₹ symbol, Baloo 2 / Inter fonts, and Indic script support.
 * Gracefully falls back to pdf-lib if Puppeteer Chromium is unavailable.
 */
async function generateActionPlanPdf(analysisData = {}) {
  const startTime = Date.now();
  logger.pipelineStage('PDF_Generation_Start', {
    documentType: analysisData.documentType || 'document'
  });

  if (puppeteer) {
    try {
      const htmlContent = generatePdfHtml(analysisData);
      const browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--font-render-hinting=none'
        ]
      });

      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'domcontentloaded', timeout: 8000 });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '12mm',
          right: '15mm',
          bottom: '14mm',
          left: '15mm'
        }
      });

      await browser.close();

      logger.pipelineStage('PDF_Generation_Complete', {
        durationMs: Date.now() - startTime,
        byteSize: pdfBuffer.length,
        engine: 'puppeteer_html'
      });

      return Buffer.from(pdfBuffer);
    } catch (puppeteerErr) {
      logger.warn('Puppeteer generation encountered an issue, falling back to pdf-lib engine', {
        error: puppeteerErr.message
      });
    }
  }

  // Fallback engine using pdf-lib
  return generatePdfLibFallback(analysisData, startTime);
}

/**
 * Fallback generator using pdf-lib
 */
async function generatePdfLibFallback(analysisData, startTime) {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const primaryIndigo = rgb(0.36, 0.37, 0.94); // #5B5FEF
  const textDark = rgb(0.11, 0.11, 0.18);      // #1C1B2E
  const textMuted = rgb(0.27, 0.26, 0.39);     // #454264
  const bgCard = rgb(0.96, 0.95, 1.0);         // #F5F3FF
  const borderCol = rgb(0.11, 0.11, 0.18);
  const white = rgb(1.0, 1.0, 1.0);

  const verdict = analysisData.authenticity?.verdict || 'Verified';
  let verdictColor = rgb(0.18, 0.75, 0.53); // #2FBF86
  if (verdict === 'Likely Fraudulent') verdictColor = rgb(1.0, 0.36, 0.36); // #FF5C5C
  else if (verdict === 'Use Caution') verdictColor = rgb(1.0, 0.70, 0.22);  // #FFB238
  else if (verdict === 'Needs Manual Review') verdictColor = rgb(0.36, 0.37, 0.94); // #5B5FEF

  let y = height - 40;

  // Header Box
  page.drawRectangle({
    x: 40,
    y: y - 10,
    width: width - 80,
    height: 48,
    color: primaryIndigo,
    borderColor: borderCol,
    borderWidth: 2
  });

  page.drawText('ClarityBridge', {
    x: 55,
    y: y + 15,
    size: 18,
    font: fontBold,
    color: white
  });

  page.drawText('Universal Document Intelligence & Action Plan Report', {
    x: 55,
    y: y + 2,
    size: 9,
    font: fontRegular,
    color: rgb(0.90, 0.90, 1.0)
  });

  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const dateFormatted = `${day}/${month}/${today.getFullYear()}`;

  page.drawText(`Date: ${dateFormatted}`, {
    x: width - 150,
    y: y + 15,
    size: 8.5,
    font: fontBold,
    color: white
  });

  page.drawText(`Currency: INR`, {
    x: width - 150,
    y: y + 2,
    size: 8,
    font: fontRegular,
    color: white
  });

  y -= 45;

  // Document Info Box
  page.drawRectangle({
    x: 40,
    y: y - 55,
    width: width - 80,
    height: 56,
    color: bgCard,
    borderColor: borderCol,
    borderWidth: 2
  });

  const docTypeLabel = (analysisData.documentType || 'Official Notice').replace(/_/g, ' ').toUpperCase();
  const authority = analysisData.issuingAuthorityClaimed || 'Official Sender';

  page.drawText(`DOCUMENT: ${docTypeLabel}`, {
    x: 55,
    y: y - 18,
    size: 11,
    font: fontBold,
    color: primaryIndigo
  });

  page.drawText(`Claimed Authority: ${authority}`, {
    x: 55,
    y: y - 34,
    size: 9.5,
    font: fontRegular,
    color: textDark
  });

  page.drawRectangle({
    x: width - 185,
    y: y - 42,
    width: 130,
    height: 28,
    color: verdictColor,
    borderColor: borderCol,
    borderWidth: 1.5
  });

  page.drawText(`VERDICT: ${verdict.toUpperCase()}`, {
    x: width - 175,
    y: y - 25,
    size: 8.5,
    font: fontBold,
    color: white
  });

  y -= 75;

  // Summary
  page.drawText('PLAIN-LANGUAGE SUMMARY', {
    x: 40,
    y: y,
    size: 11,
    font: fontBold,
    color: textDark
  });
  y -= 14;

  const summary = analysisData.summary || 'Summary unavailable.';
  const summaryLines = wrapText(summary, 75);
  for (const line of summaryLines.slice(0, 4)) {
    page.drawText(line, {
      x: 40,
      y: y,
      size: 9.5,
      font: fontRegular,
      color: textDark
    });
    y -= 13;
  }

  y -= 15;

  // Action Steps
  page.drawText('REQUIRED ACTION PLAN (BY PRIORITY)', {
    x: 40,
    y: y,
    size: 11,
    font: fontBold,
    color: textDark
  });
  y -= 18;

  const steps = analysisData.actionPlan?.steps || [];
  for (const step of steps.slice(0, 5)) {
    if (y < 120) break;

    let pColor = primaryIndigo;
    const pLower = (step.priority || '').toLowerCase();
    if (pLower.includes('urgent')) pColor = rgb(1.0, 0.36, 0.36);
    else if (pLower.includes('high')) pColor = rgb(1.0, 0.70, 0.22);
    else if (pLower.includes('low')) pColor = rgb(0.18, 0.75, 0.53);

    page.drawRectangle({
      x: 40,
      y: y - 46,
      width: width - 80,
      height: 48,
      color: white,
      borderColor: borderCol,
      borderWidth: 1.5
    });

    page.drawRectangle({
      x: 48,
      y: y - 16,
      width: 50,
      height: 12,
      color: pColor
    });

    page.drawText((step.priority || 'STEP').toUpperCase(), {
      x: 52,
      y: y - 13,
      size: 7,
      font: fontBold,
      color: white
    });

    const titleText = `${step.id ? step.id + '. ' : ''}${step.title || 'Action Required'}`;
    page.drawText(truncate(titleText, 45), {
      x: 105,
      y: y - 14,
      size: 9.5,
      font: fontBold,
      color: textDark
    });

    if (step.deadline) {
      page.drawText(`Deadline: ${step.deadline}`, {
        x: width - 180,
        y: y - 14,
        size: 8.5,
        font: fontBold,
        color: rgb(0.85, 0.2, 0.2)
      });
    }

    const desc = step.description || '';
    const descLines = wrapText(desc, 80);
    if (descLines[0]) {
      page.drawText(descLines[0], {
        x: 48,
        y: y - 30,
        size: 8.5,
        font: fontRegular,
        color: textDark
      });
    }
    if (step.contact) {
      page.drawText(`Contact: ${step.contact}`, {
        x: 48,
        y: y - 41,
        size: 7.5,
        font: fontOblique,
        color: primaryIndigo
      });
    }

    y -= 54;
  }

  // DPDP Act Disclaimer Footer
  const disclaimerBoxY = 36;
  page.drawRectangle({
    x: 40,
    y: disclaimerBoxY,
    width: width - 80,
    height: 38,
    color: bgCard,
    borderColor: rgb(0.80, 0.80, 0.88),
    borderWidth: 1
  });

  const disclaimer1 = 'DPDP Act 2023 & Civic Notice: ClarityBridge is an assistive triage tool — it is not a lawyer, CA, or government body.';
  const disclaimer2 = 'Zero persistent PII retained. Verify official notices directly on statutory portals (incometax.gov.in, gst.gov.in, 1930 Helpline).';

  page.drawText(disclaimer1, {
    x: 48,
    y: disclaimerBoxY + 22,
    size: 6.5,
    font: fontBold,
    color: textMuted
  });

  page.drawText(disclaimer2, {
    x: 48,
    y: disclaimerBoxY + 10,
    size: 6.5,
    font: fontRegular,
    color: textMuted
  });

  const pdfBytes = await pdfDoc.save();
  logger.pipelineStage('PDF_Generation_Complete', {
    durationMs: Date.now() - startTime,
    byteSize: pdfBytes.length,
    engine: 'pdf-lib'
  });

  return Buffer.from(pdfBytes);
}

function safeWinAnsi(str) {
  if (!str) return '';
  return str.replace(/[^\x00-\x7F\xA0-\xFF]/g, '?');
}

function wrapText(text, maxChars) {
  if (!text) return [];
  const safe = safeWinAnsi(text);
  const words = safe.split(' ');
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
  const safe = safeWinAnsi(str);
  return safe.length > maxLen ? safe.substring(0, maxLen - 3) + '...' : safe;
}

module.exports = {
  generateActionPlanPdf,
  wrapText,
  truncate,
  safeWinAnsi
};
