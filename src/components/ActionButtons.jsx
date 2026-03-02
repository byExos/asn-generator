export default function ActionButtons({ generating, onGenerate, onReset }) {
  return (
    <div className="actions">
      <button onClick={onReset} className="btn btn-secondary">
        Reset to Defaults
      </button>
      <button
        onClick={onGenerate}
        disabled={generating}
        className="btn btn-primary"
      >
        {generating ? "Generating..." : "Generate PDF"}
      </button>
    </div>
  );
}
