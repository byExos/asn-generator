/**
 * Converts the internal config format to the PDF generator config format
 */
export const toPdfConfig = (currentConfig) => ({
  margins: {
    left: currentConfig.marginLeft,
    right: currentConfig.marginRight,
    top: currentConfig.marginTop,
    bottom: currentConfig.marginBottom,
  },
  rows: currentConfig.rows,
  cols: currentConfig.cols,
  hSpacing: currentConfig.hSpacing,
  vSpacing: currentConfig.vSpacing,
  startAsn: currentConfig.startAsn,
  qty: currentConfig.qty,
  qrSizeMm: currentConfig.qrSizeMm,
  qrError: currentConfig.qrError,
  textTemplate: currentConfig.textTemplate,
  fontSize: currentConfig.fontSize,
  showGrid: currentConfig.showGrid,
  filename: currentConfig.filename,
  textPosition: currentConfig.textPosition,
  labelRotated: currentConfig.labelRotated,
});
