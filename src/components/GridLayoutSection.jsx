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
          Label width (mm):
          <input
            type="number"
            name="labelWidth"
            value={config.labelWidth ?? ""}
            onChange={onChange}
            min="1"
            step="0.5"
            placeholder="auto"
          />
        </label>
        <label>
          Label height (mm):
          <input
            type="number"
            name="labelHeight"
            value={config.labelHeight ?? ""}
            onChange={onChange}
            min="1"
            step="0.5"
            placeholder="auto"
          />
        </label>
      </div>
    </section>
  );
}
