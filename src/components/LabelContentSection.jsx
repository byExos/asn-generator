import { asnTemplateValue } from "../utils/template";

export default function LabelContentSection({ config, onChange, isQtyManual }) {
  const handlePositionClick = (position) => {
    onChange({
      target: { name: "textPosition", value: position },
    });
  };

  const isLR = config.textPosition === "left" || config.textPosition === "right";

  return (
    <section className="section">
      <h2>Label Content</h2>
      <div className="form-row">
        <label>
          Starting ASN:
          <input
            type="number"
            name="startAsn"
            value={config.startAsn}
            onChange={onChange}
            min="1"
          />
        </label>
        <label>
          Total quantity:
          <input
            type="number"
            name="qty"
            value={config.qty}
            onChange={onChange}
            min="1"
          />
        </label>
      </div>
      <div className="form-row full-width">
        <span className="field-hint">
          {isQtyManual
            ? "Quantity is manually set."
            : "Quantity auto-follows rows × columns until manually changed."}
        </span>
      </div>
      <div className="form-row full-width">
        <label>
          Text template (single line, use {"{asn}"} for number):
          <input
            type="text"
            name="textTemplate"
            value={config.textTemplate}
            onChange={onChange}
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Font size (pt):
          <input
            type="number"
            name="fontSize"
            value={config.fontSize}
            onChange={onChange}
            min="3"
            max="24"
          />
        </label>
      </div>
      <div className="form-row full-width">
        <label>Text position around QR code:</label>
        <div className="position-selector">
          <button
            className={`position-btn top ${config.textPosition === "top" ? "active" : ""}`}
            onClick={() => handlePositionClick("top")}
            title="Text above QR"
          >
            {asnTemplateValue(config.textTemplate, config.startAsn)}
          </button>
          <div className="position-sides">
            <button
              className={`position-btn left ${config.textPosition === "left" ? "active" : ""} ${!config.labelRotated ? "horizontal" : ""}`}
              onClick={() => handlePositionClick("left")}
              title="Text left of QR"
            >
              {config.labelRotated ? (
                <span className="rotated-text">
                  {asnTemplateValue(config.textTemplate, config.startAsn)}
                </span>
              ) : (
                asnTemplateValue(config.textTemplate, config.startAsn)
              )}
            </button>
            <div className="qr-preview">QR</div>
            <button
              className={`position-btn right ${config.textPosition === "right" ? "active" : ""} ${!config.labelRotated ? "horizontal" : ""}`}
              onClick={() => handlePositionClick("right")}
              title="Text right of QR"
            >
              {config.labelRotated ? (
                <span className="rotated-text">
                  {asnTemplateValue(config.textTemplate, config.startAsn)}
                </span>
              ) : (
                asnTemplateValue(config.textTemplate, config.startAsn)
              )}
            </button>
          </div>
          <button
            className={`position-btn bottom ${config.textPosition === "bottom" ? "active" : ""}`}
            onClick={() => handlePositionClick("bottom")}
            title="Text below QR"
          >
            {asnTemplateValue(config.textTemplate, config.startAsn)}
          </button>
        </div>
      </div>
      {isLR && (
        <div className="form-row full-width">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="labelRotated"
              checked={config.labelRotated}
              onChange={onChange}
            />
            Rotate label text
          </label>
        </div>
      )}
    </section>
  );
}
