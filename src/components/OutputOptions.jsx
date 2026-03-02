export default function OutputOptions({ config, onChange }) {
  return (
    <section className="section">
      <h2>Output Options</h2>
      <div className="form-row full-width">
        <label>
          Filename:
          <input
            type="text"
            name="filename"
            value={config.filename}
            onChange={onChange}
          />
        </label>
      </div>
      <div className="form-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="showGrid"
            checked={config.showGrid}
            onChange={onChange}
          />
          Show grid lines (for alignment testing)
        </label>
      </div>
    </section>
  );
}
