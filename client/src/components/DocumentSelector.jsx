export default function DocumentSelector({
  documents,
  selectedDocumentId,
  onSelect,
  disabled
}) {
  return (
    <div className="document-selector">
      <label htmlFor="document">
        Select document
      </label>

      <select
        id="document"
        value={selectedDocumentId || ""}
        onChange={(event) =>
          onSelect(event.target.value)
        }
        disabled={disabled}
      >
        <option value="">
          Select a document
        </option>

        {documents.map((document) => (
          <option
            key={document.id}
            value={document.id}
            disabled={
              document.status !== "ready"
            }
          >
            {document.filename} (
            {document.status})
          </option>
        ))}
      </select>
    </div>
  );
}