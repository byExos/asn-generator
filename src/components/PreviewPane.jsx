import React from 'react';
import '../App.css';

export default function PreviewPane({ previewUrl, previewLoading, previewError }) {
  return (
    <div className="preview-section">
      <div className="preview-title-row">
        <h2>Preview</h2>
        <div className="preview-state">{previewLoading ? 'Loading...' : 'Ready'}</div>
      </div>
      {previewError && <p className="preview-error">{previewError}</p>}
      <iframe className="preview-frame" src={previewUrl} title="PDF Preview" />
    </div>
  );
}
