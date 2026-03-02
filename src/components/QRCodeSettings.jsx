export default function QRCodeSettings({ config, onChange }) {
  return (
    <section className="section">
      <h2>QR Code Settings</h2>
      <div className="form-row">
        <label>
          QR code size (mm):
          <input
            type="number"
            name="qrSizeMm"
            value={config.qrSizeMm}
            onChange={onChange}
            min="10"
            max="50"
          />
        </label>
        <label>
          Error correction:
          <select name="qrError" value={config.qrError} onChange={onChange}>
            <option value="L">Low (7%)</option>
            <option value="M">Medium (15%)</option>
            <option value="Q">Quartile (25%)</option>
            <option value="H">High (30%)</option>
          </select>
        </label>
      </div>
    </section>
  );
}
