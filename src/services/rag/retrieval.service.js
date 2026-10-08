import { pool } from "../../db/pool.js";

import { generateEmbeddings } from "../../providers/embeddings/index.js";

export async function retrieveRelevantChunks(query, options = {}) {
  const { documentId = null, topK = 8 } = options;

  if (!query?.trim()) {
    return [];
  }

  if (!Number.isInteger(topK) || topK < 1 || topK > 20) {
    throw new Error("topK must be an integer between 1 and 20.");
  }

  const embeddings = await generateEmbeddings([query.trim()]);

  const queryEmbedding = embeddings[0];

  if (!queryEmbedding) {
    throw new Error("Failed to generate query embedding.");
  }

  const vector = JSON.stringify(queryEmbedding);

  const values = [vector, topK];

  let documentFilter = "";

  if (documentId) {
    values.push(documentId);

    documentFilter = "AND dc.document_id = $3";
  }

  const result = await pool.query(
    `
      SELECT
        dc.id,
        dc.document_id,
        dc.chunk_index,
        dc.content,
        dc.page_number,
        dc.metadata,
        d.filename,

        1 - (
          dc.embedding <=> $1::vector
        ) AS similarity

      FROM document_chunks dc

      INNER JOIN documents d
        ON d.id = dc.document_id

      WHERE d.status = 'ready'
        AND dc.embedding IS NOT NULL
        ${documentFilter}

      ORDER BY
        dc.embedding <=> $1::vector

      LIMIT $2
      `,
    values,
  );

  return result.rows;
}
