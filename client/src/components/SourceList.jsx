export default function SourceList({ sources }) {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="sources">
      <strong>Sources</strong>

      <ul>
        {sources.map((source) => (
          <li key={source.sourceId}>
            {source.filename}

            {" — chunk "}

            {source.chunkIndex}

            {source.pageNumber ? ` — page ${source.pageNumber}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
