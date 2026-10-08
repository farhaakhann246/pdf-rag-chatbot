export function buildRagContext(chunks) {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    return {
      context: "",
      sources: [],
    };
  }

  const sources = chunks.map((chunk, index) => ({
    sourceId: `source-${index + 1}`,
    documentId: chunk.document_id,
    filename: chunk.filename,
    chunkIndex: chunk.chunk_index,
    pageNumber: chunk.page_number ?? null,
  }));

  const context = chunks
    .map((chunk, index) => {
      return [
        `[SOURCE ${index + 1}]`,
        `Document: ${chunk.filename}`,
        `Chunk: ${chunk.chunk_index}`,
        chunk.page_number ? `Page: ${chunk.page_number}` : null,
        "",
        chunk.content,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n------------------------------\n\n");

  return {
    context,
    sources,
  };
}
