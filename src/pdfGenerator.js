import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

// ============================================================================
// Constants
// ============================================================================

/** Conversion factor from millimeters to points (PDF unit) */
const MM_TO_PT = 2.834645669;

/** DPI for QR code generation when downloading final PDF */
const DOWNLOAD_QR_DPI = 144;

/** DPI for QR code generation in preview mode (lower for performance) */
const PREVIEW_QR_DPI = 96;

/** A4 page dimensions in points */
const A4_WIDTH_PT = 210 * MM_TO_PT;
const A4_HEIGHT_PT = 297 * MM_TO_PT;

/** QR code size constraints in pixels */
const QR_MIN_PIXELS = 64;
const QR_MAX_PIXELS = 220;

/** Visual constants for PDF rendering */
const GRID_LINE_COLOR = { r: 190, g: 190, b: 190 };
const GRID_LINE_WIDTH_PT = 0.35;
const TEXT_COLOR = { r: 0, g: 0, b: 0 };
const TEXT_GAP_MM = 2; // Gap between QR code and text
const TEXT_HEIGHT_FACTOR = 0.35; // Multiplier to convert font size to text height

/** Valid QR code error correction levels */
const QR_ERROR_LEVELS = ['L', 'M', 'Q', 'H'];
const DEFAULT_QR_ERROR_LEVEL = 'M';

/** Timeout for revoking object URLs after download */
const URL_REVOKE_TIMEOUT_MS = 2000;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Converts millimeters to points (PDF coordinate unit).
 * @param {number} mm - Value in millimeters
 * @returns {number} Value in points
 */
const mmToPt = (mm) => mm * MM_TO_PT;

/**
 * Clamps a value between a minimum and maximum.
 * @param {number} value - The value to clamp
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} Clamped value
 */
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/**
 * Normalizes and validates QR code error correction level.
 * @param {string} value - Error correction level (L, M, Q, or H)
 * @returns {string} Normalized error correction level
 */
const normalizeQrError = (value) => {
  const normalized = String(value || DEFAULT_QR_ERROR_LEVEL).toUpperCase();
  return QR_ERROR_LEVELS.includes(normalized) ? normalized : DEFAULT_QR_ERROR_LEVEL;
};

/**
 * Replaces {asn} placeholder in template with actual ASN value.
 * Also normalizes line breaks to spaces for single-line rendering.
 * @param {string} template - Template string containing {asn} placeholder
 * @param {number} asn - ASN number to insert
 * @returns {string} Processed template string
 */
const renderAsnTemplate = (template, asn) =>
  String(template)
    .split('{asn}')
    .join(String(asn))
    .replace(/\r?\n/g, ' ');

// ============================================================================
// Layout Calculation Functions
// ============================================================================

/**
 * Calculates label dimensions based on page size, margins, and grid configuration.
 * @param {Object} params - Layout parameters
 * @param {Object} params.margins - Margin values in mm
 * @param {number} params.rows - Number of label rows
 * @param {number} params.cols - Number of label columns
 * @param {number} params.hSpacing - Horizontal spacing between labels in mm
 * @param {number} params.vSpacing - Vertical spacing between labels in mm
 * @returns {Object} Label dimensions and positions
 */
const calculateLabelLayout = ({ margins, rows, cols, hSpacing, vSpacing }) => {
  // Convert margins and spacing from mm to pt
  const marginsPt = {
    left: mmToPt(margins.left),
    right: mmToPt(margins.right),
    top: mmToPt(margins.top),
    bottom: mmToPt(margins.bottom),
  };
  const hSpacePt = mmToPt(hSpacing);
  const vSpacePt = mmToPt(vSpacing);

  // Calculate usable area for labels
  const usableWidth = A4_WIDTH_PT - marginsPt.left - marginsPt.right - (cols - 1) * vSpacePt;
  const usableHeight = A4_HEIGHT_PT - marginsPt.top - marginsPt.bottom - (rows - 1) * hSpacePt;

  // Calculate individual label dimensions
  const labelWidth = usableWidth / cols;
  const labelHeight = usableHeight / rows;

  // Validate that labels have positive dimensions
  if (labelWidth <= 0 || labelHeight <= 0) {
    throw new Error('Invalid grid/margins/spacing produce non-positive label size');
  }

  return {
    labelWidth,
    labelHeight,
    margins: marginsPt,
    hSpacing: hSpacePt,
    vSpacing: vSpacePt,
  };
};

/**
 * Calculates the QR code pixel width based on size and DPI.
 * @param {number} qrSizeMm - QR code size in millimeters
 * @param {number} dpi - Target DPI for QR code generation
 * @returns {number} QR code width in pixels
 */
const calculateQrPixelWidth = (qrSizeMm, dpi) => {
  const inches = qrSizeMm / 25.4;
  const pixels = Math.round(inches * dpi);
  return clamp(pixels, QR_MIN_PIXELS, QR_MAX_PIXELS);
};

// ============================================================================
// QR Code Generation
// ============================================================================

/**
 * Generates a QR code data URL for the given text.
 * @param {string} data - Data to encode in QR code
 * @param {string} errorLevel - Error correction level (L, M, Q, H)
 * @param {number} pixelWidth - QR code width in pixels
 * @returns {Promise<string>} Data URL of the QR code image
 */
const generateQrCodeDataUrl = async (data, errorLevel, pixelWidth) => {
  return await QRCode.toDataURL(data, {
    errorCorrectionLevel: errorLevel,
    margin: 1,
    width: pixelWidth,
  });
};

// ============================================================================
// Label Rendering Functions
// ============================================================================

/**
 * Draws grid lines around a label (for debugging/alignment).
 * @param {jsPDF} pdf - PDF document instance
 * @param {number} x - Label X position
 * @param {number} y - Label Y position
 * @param {number} width - Label width
 * @param {number} height - Label height
 */
const drawLabelGrid = (pdf, x, y, width, height) => {
  pdf.setDrawColor(GRID_LINE_COLOR.r, GRID_LINE_COLOR.g, GRID_LINE_COLOR.b);
  pdf.setLineWidth(GRID_LINE_WIDTH_PT);
  pdf.rect(x, y, width, height);
};

/**
 * Calculates text dimensions for positioning.
 * @param {jsPDF} pdf - PDF document instance
 * @param {string} text - Text to measure
 * @param {number} fontSize - Font size in points
 * @returns {Object} Text dimensions
 */
const getTextDimensions = (pdf, text, fontSize) => {
  const width = pdf.getTextWidth(text);
  const height = fontSize * TEXT_HEIGHT_FACTOR;
  return { width, height };
};

/**
 * Renders label content with QR code and text positioned at the bottom.
 * @param {jsPDF} pdf - PDF document instance
 * @param {Object} params - Positioning parameters
 */
const renderLabelBottomText = (pdf, params) => {
  const { x, y, labelWidth, labelHeight, qrDataUrl, qrSizePt, text, textDims } = params;
  const textGapPt = mmToPt(TEXT_GAP_MM);

  // Calculate vertical centering for QR + text stack
  const totalHeight = qrSizePt + textGapPt + textDims.height;
  const centerYOffset = (labelHeight - totalHeight) / 2;

  // Position QR code
  const qrX = x + (labelWidth - qrSizePt) / 2;
  const qrY = y + centerYOffset;
  pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSizePt, qrSizePt);

  // Position text below QR code
  const textX = x + (labelWidth - textDims.width) / 2;
  const textY = qrY + qrSizePt + textGapPt + textDims.height;
  pdf.text(text, textX, textY);
};

/**
 * Renders label content with QR code and text positioned at the top.
 * @param {jsPDF} pdf - PDF document instance
 * @param {Object} params - Positioning parameters
 */
const renderLabelTopText = (pdf, params) => {
  const { x, y, labelWidth, labelHeight, qrDataUrl, qrSizePt, text, textDims } = params;
  const textGapPt = mmToPt(TEXT_GAP_MM);

  // Calculate vertical centering for text + QR stack
  const totalHeight = textDims.height + textGapPt + qrSizePt;
  const centerYOffset = (labelHeight - totalHeight) / 2;

  // Position text at top
  const textX = x + (labelWidth - textDims.width) / 2;
  const textY = y + centerYOffset + textDims.height;
  pdf.text(text, textX, textY, { align: 'left', baseline: 'hanging' });

  // Position QR code below text
  const qrX = x + (labelWidth - qrSizePt) / 2;
  const qrY = textY + textGapPt;
  pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSizePt, qrSizePt);
};

/**
 * Renders label content with rotated text on the left, QR code on the right.
 * @param {jsPDF} pdf - PDF document instance
 * @param {Object} params - Positioning parameters
 */
const renderLabelLeftText = (pdf, params) => {
  const { x, y, labelWidth, labelHeight, qrDataUrl, qrSizePt, text, textDims } = params;
  const textGapPt = mmToPt(TEXT_GAP_MM);

  // When rotated, text height becomes the horizontal "width" it occupies
  const rotatedTextWidth = textDims.height;
  const totalWidth = rotatedTextWidth + textGapPt + qrSizePt;
  const centerXOffset = Math.max(0, (labelWidth - totalWidth) / 2);

  // Position text column on left
  const textColumnX = x + centerXOffset;
  const textCenterX = textColumnX + textDims.height;
  const textCenterY = y + (labelHeight - textDims.width) / 2;
  pdf.text(text, textCenterX, textCenterY, {
    angle: 90,
    align: 'left',
    baseline: 'bottom',
    rotationDirection: 0,
    lineHeightFactor: 1,
  });

  // Position QR code on right
  const qrX = textColumnX + rotatedTextWidth + textGapPt;
  const qrY = y + (labelHeight - qrSizePt) / 2;
  pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSizePt, qrSizePt);
};

/**
 * Renders label content with QR code on the left, rotated text on the right.
 * @param {jsPDF} pdf - PDF document instance
 * @param {Object} params - Positioning parameters
 */
const renderLabelRightText = (pdf, params) => {
  const { x, y, labelWidth, labelHeight, qrDataUrl, qrSizePt, text, textDims } = params;
  const textGapPt = mmToPt(TEXT_GAP_MM);

  // Calculate horizontal centering for QR + text layout
  const rotatedTextWidth = textDims.height;
  const totalWidth = qrSizePt + textGapPt + rotatedTextWidth;
  const centerXOffset = Math.max(0, (labelWidth - totalWidth) / 2);

  // Position QR code on left
  const qrX = x + centerXOffset;
  const qrY = y + (labelHeight - qrSizePt) / 2;
  pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSizePt, qrSizePt);

  // Position rotated text on right
  const textColumnLeft = qrX + qrSizePt + textGapPt;
  const textCenterX = textColumnLeft + rotatedTextWidth / 2;
  const textCenterY = qrY + qrSizePt / 2 + textDims.width / 2;
  pdf.text(text, textCenterX, textCenterY, {
    angle: 90,
    align: 'left',
    baseline: 'bottom',
    lineHeightFactor: 1,
  });
};

/**
 * Renders a single label with QR code and text.
 * @param {jsPDF} pdf - PDF document instance
 * @param {Object} params - Label rendering parameters
 */
const renderLabel = async (pdf, params) => {
  const {
    x,
    y,
    labelWidth,
    labelHeight,
    asn,
    textTemplate,
    fontSize,
    qrError,
    qrPixelWidth,
    qrSizeMm,
    textPosition,
    showGrid,
  } = params;

  // Draw grid if enabled (useful for debugging layout)
  if (showGrid) {
    drawLabelGrid(pdf, x, y, labelWidth, labelHeight);
  }

  // Generate label text and QR code
  const text = renderAsnTemplate(textTemplate, asn);
  const qrDataUrl = await generateQrCodeDataUrl(text, qrError, qrPixelWidth);
  const qrSizePt = mmToPt(qrSizeMm);

  // Set text properties
  pdf.setFontSize(fontSize);
  pdf.setTextColor(TEXT_COLOR.r, TEXT_COLOR.g, TEXT_COLOR.b);

  // Calculate text dimensions
  const textDims = getTextDimensions(pdf, text, fontSize);

  // Prepare common parameters for positioning functions
  const renderParams = {
    x,
    y,
    labelWidth,
    labelHeight,
    qrDataUrl,
    qrSizePt,
    text,
    textDims,
  };

  // Render label based on text position preference
  switch (textPosition) {
    case 'top':
      renderLabelTopText(pdf, renderParams);
      break;
    case 'left':
      renderLabelLeftText(pdf, renderParams);
      break;
    case 'right':
      renderLabelRightText(pdf, renderParams);
      break;
    case 'bottom':
    default:
      renderLabelBottomText(pdf, renderParams);
      break;
  }
};

// ============================================================================
// PDF Generation
// ============================================================================

/**
 * Builds a PDF document with ASN labels.
 * @param {Object} config - Configuration object
 * @param {Object} options - Generation options
 * @param {boolean} options.preview - If true, only generates first page
 * @returns {Promise<jsPDF>} PDF document instance
 */
async function buildPdf(config, { preview = false } = {}) {
  // Extract and set default configuration values
  const {
    margins = { left: 10, right: 10, top: 10, bottom: 10 },
    rows = 8,
    cols = 3,
    hSpacing = 5,
    vSpacing = 5,
    startAsn = 1,
    qty = rows * cols,
    qrSizeMm = 25,
    qrError = 'M',
    textTemplate = 'ASN: {asn}',
    fontSize = 9,
    showGrid = false,
    textPosition = 'bottom',
  } = config;

  // Calculate effective quantities and settings
  const totalQty = Math.max(1, Number(qty));
  const labelsPerPage = Math.max(1, Number(rows) * Number(cols));
  const effectiveQty = preview ? Math.min(totalQty, labelsPerPage) : totalQty;
  const effectiveQrError = normalizeQrError(qrError);
  const targetQrDpi = preview ? PREVIEW_QR_DPI : DOWNLOAD_QR_DPI;

  // Calculate label layout dimensions
  const layout = calculateLabelLayout({ margins, rows, cols, hSpacing, vSpacing });

  // Calculate QR code pixel dimensions
  const qrPixelWidth = calculateQrPixelWidth(qrSizeMm, targetQrDpi);

  // Initialize PDF document
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
    compress: true,
    putOnlyUsedFonts: true,
    precision: 2,
  });

  // Generate labels across pages
  let currentAsn = Number(startAsn);
  let labelsGenerated = 0;
  let isFirstPage = true;

  while (labelsGenerated < effectiveQty) {
    // Add new page for subsequent pages
    if (!isFirstPage) {
      pdf.addPage();
    }
    isFirstPage = false;

    // Generate labels in grid layout (row by row, column by column)
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Stop if we've generated all requested labels
        if (labelsGenerated >= effectiveQty) break;

        // Calculate label position
        const x = layout.margins.left + col * (layout.labelWidth + layout.vSpacing);
        const y = layout.margins.top + row * (layout.labelHeight + layout.hSpacing);

        // Render the label
        await renderLabel(pdf, {
          x,
          y,
          labelWidth: layout.labelWidth,
          labelHeight: layout.labelHeight,
          asn: currentAsn,
          textTemplate,
          fontSize,
          qrError: effectiveQrError,
          qrPixelWidth,
          qrSizeMm,
          textPosition,
          showGrid,
        });

        currentAsn++;
        labelsGenerated++;
      }

      // Break outer loop if we've generated all labels
      if (labelsGenerated >= effectiveQty) break;
    }
  }

  return pdf;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Generates and downloads an ASN label PDF file.
 * 
 * This function creates a PDF document with the specified configuration,
 * converts it to a Blob, creates a download link, and triggers the download.
 * The object URL is automatically revoked after a short timeout.
 * 
 * @param {Object} config - Configuration object for label generation
 * @param {Object} [config.margins] - Page margins in mm (left, right, top, bottom)
 * @param {number} [config.rows] - Number of label rows per page
 * @param {number} [config.cols] - Number of label columns per page
 * @param {number} [config.hSpacing] - Horizontal spacing between labels in mm
 * @param {number} [config.vSpacing] - Vertical spacing between labels in mm
 * @param {number} [config.startAsn] - Starting ASN number
 * @param {number} [config.qty] - Total quantity of labels to generate
 * @param {number} [config.qrSizeMm] - QR code size in mm
 * @param {string} [config.qrError] - QR error correction level (L, M, Q, H)
 * @param {string} [config.textTemplate] - Template string with {asn} placeholder
 * @param {number} [config.fontSize] - Font size for label text
 * @param {boolean} [config.showGrid] - Whether to show grid lines around labels
 * @param {string} [config.textPosition] - Text position (top, bottom, left, right)
 * @param {string} [config.filename] - Output filename for download
 * @returns {Promise<void>}
 */
export async function generateLabelPDF(config) {
  const filename = config.filename || 'asn_labels.pdf';

  // Generate PDF as a Blob
  const blob = await generateLabelPdfBlob(config);

  // Create temporary download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  // Clean up object URL after download completes
  setTimeout(() => URL.revokeObjectURL(url), URL_REVOKE_TIMEOUT_MS);
}

/**
 * Generates an ASN labels PDF and returns it as a Blob.
 * 
 * This function is useful for previewing PDFs in an iframe or PDF viewer
 * without triggering a download. When preview mode is enabled, only the
 * first page is generated for performance.
 * 
 * @param {Object} config - Configuration object (see generateLabelPDF for details)
 * @param {Object} [options] - Generation options
 * @param {boolean} [options.preview=false] - If true, only generate first page
 * @returns {Promise<Blob>} PDF document as a Blob
 */
export async function generateLabelPdfBlob(config, options = {}) {
  const pdf = await buildPdf(config, options);
  return pdf.output('blob');
}
