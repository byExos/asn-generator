export default function InfoPanel({ rows, cols, qty }) {
  const labelsPerPage = rows * cols;
  const totalPages = Math.ceil(qty / labelsPerPage);
  const hasMultiplePages = qty > labelsPerPage;

  return (
    <div className="info">
      <p>
        <strong>Preview:</strong> {rows} × {cols} = {labelsPerPage} labels per
        page
        {hasMultiplePages && ` • ${totalPages} pages total`}
      </p>
    </div>
  );
}
