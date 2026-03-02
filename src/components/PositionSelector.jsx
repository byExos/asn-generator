import React from 'react';
import '../App.css';
import { asnTemplateValue } from '../utils/template';

export default function PositionSelector({ config, onChange }) {
  return (
    <div className="form-row full-width">
      <label>Text position around QR code:</label>
      <div className="position-selector">
        <button
          className={`position-btn top ${config.textPosition === 'top' ? 'active' : ''}`}
          onClick={() => onChange({ target: { name: 'textPosition', value: 'top' } })}
          title="Text above QR"
        >
          {asnTemplateValue(config.textTemplate, config.startAsn)}
        </button>
        <div className="position-sides">
          <button
            className={`position-btn left ${config.textPosition === 'left' ? 'active' : ''}`}
            onClick={() => onChange({ target: { name: 'textPosition', value: 'left' } })}
            title="Text left of QR"
          >
            <span className="rotated-text">{asnTemplateValue(config.textTemplate, config.startAsn)}</span>
          </button>
          <div className="qr-preview">QR</div>
          <button
            className={`position-btn right ${config.textPosition === 'right' ? 'active' : ''}`}
            onClick={() => onChange({ target: { name: 'textPosition', value: 'right' } })}
            title="Text right of QR"
          >
            <span className="rotated-text">{asnTemplateValue(config.textTemplate, config.startAsn)}</span>
          </button>
        </div>
        <button
          className={`position-btn bottom ${config.textPosition === 'bottom' ? 'active' : ''}`}
          onClick={() => onChange({ target: { name: 'textPosition', value: 'bottom' } })}
          title="Text below QR"
        >
          {asnTemplateValue(config.textTemplate, config.startAsn)}
        </button>
      </div>
    </div>
  );
}
