export default function GridLayoutSection({ config, onChange }) {
  return (
    <section className="section">
      <h2>Grid Layout</h2>
      <div className="form-row">
        <label>
          Rows per page:
          <input
            type="number"
            name="rows"
            value={config.rows}
            onChange={onChange}
            min="1"
            max="20"
          />
        </label>
        <label>
          Columns per page:
          <input
            type="number"
            name="cols"
            value={config.cols}
            onChange={onChange}
            min="1"
            max="10"
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Horizontal spacing (mm):
          <input
            type="number"
            name="hSpacing"
            value={config.hSpacing}
            onChange={onChange}
            min="0"
            step="0.5"
          />
        </label>
        <label>
          Vertical spacing (mm):
          <input
            type="number"
            name="vSpacing"
            value={config.vSpacing}
            onChange={onChange}
            min="0"
            step="0.5"
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Margin left (mm):
          <input
            type="number"
            name="marginLeft"
            value={config.marginLeft}
            onChange={onChange}
            min="0"
            step="0.5"
          />
        </label>
        <label>
          Margin right (mm):
          <input
            type="number"
            name="marginRight"
            value={config.marginRight}
            onChange={onChange}
            min="0"
            step="0.5"
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Margin top (mm):
          <input
            type="number"
            name="marginTop"
            value={config.marginTop}
            onChange={onChange}
            min="0"
            step="0.5"
          />
        </label>
        <label>
          Margin bottom (mm):
          <input
            type="number"
            name="marginBottom"
            value={config.marginBottom}
            onChange={onChange}
            min="0"
            step="0.5"
          />
        </label>
      </div>
    </section>
  );
}
