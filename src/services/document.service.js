import { pool } from "../db/pool.js";
import fs from "fs/promises";

import { extractPdfText } from "./rag/ingestion.service.js";
import { calculateFileHash } from "../utils/file-hash.js";
import { createChunks } from "./rag/chunk.service.js";
import { generateEmbeddings } from "../providers/embeddings/index.js";

console.log(
  "🔥 LOADED DOCUMENT SERVICE:",
  import.meta.url
);

export async function processDocumentUpload(file) {
  console.log(
    "🔥 DOCUMENT UPLOAD STARTED:",
    file.originalname
  );

  let documentId = null;

  try {
    /*
     * ----------------------------------------------------
     * 1. Calculate SHA-256 hash
     * ----------------------------------------------------
     */

    const fileHash =
      await calculateFileHash(file.path);

    console.log(
      "FILE HASH:",
      fileHash
    );

    /*
     * ----------------------------------------------------
     * 2. Check whether this PDF already exists
     * ----------------------------------------------------
     */

    const existingResult =
      await pool.query(
        `
        SELECT
          id,
          filename,
          mime_type,
          file_size,
          file_hash,
          page_count,
          status,
          created_at,
          updated_at
        FROM documents
        WHERE file_hash = $1
        LIMIT 1
        `,
        [fileHash]
      );

    if (existingResult.rows.length > 0) {
      const existingDocument =
        existingResult.rows[0];

      console.log(
        "♻️ DUPLICATE DOCUMENT FOUND:",
        existingDocument.id
      );

      /*
       * The newly uploaded physical file is
       * not required because the original document
       * already exists.
       */

      try {
        await fs.unlink(file.path);

        console.log(
          "🗑️ Duplicate uploaded file removed."
        );
      } catch (cleanupError) {
        console.error(
          "Failed to remove duplicate uploaded file:",
          cleanupError
        );
      }

      return {
        document: existingDocument,
        chunkCount: null,
        duplicate: true,
        message:
          "This document has already been uploaded."
      };
    }

    /*
     * ----------------------------------------------------
     * 3. Create document record with processing status
     *
     * This is intentionally committed BEFORE
     * expensive PDF processing.
     * ----------------------------------------------------
     */

    const documentResult =
      await pool.query(
        `
        INSERT INTO documents (
          filename,
          mime_type,
          file_size,
          file_hash,
          status
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id,
          filename,
          mime_type,
          file_size,
          file_hash,
          status,
          created_at
        `,
        [
          file.originalname,
          file.mimetype,
          file.size,
          fileHash,
          "processing"
        ]
      );

    const document =
      documentResult.rows[0];

    documentId = document.id;

    console.log(
      "📄 DOCUMENT CREATED:",
      document
    );

    /*
     * ----------------------------------------------------
     * 4. Extract PDF text
     * ----------------------------------------------------
     */

    const extracted =
      await extractPdfText(file.path);

    console.log(
      "📖 PDF TEXT EXTRACTED:",
      {
        pageCount:
          extracted.pageCount,
        textLength:
          extracted.cleanedText.length
      }
    );

    /*
     * ----------------------------------------------------
     * 5. Create chunks
     * ----------------------------------------------------
     */

    const chunks =
      createChunks(
        extracted.cleanedText
      );

    if (chunks.length === 0) {
      throw new Error(
        "No readable text found in PDF."
      );
    }

    console.log(
      "🧩 CHUNKS CREATED:",
      chunks.length
    );

    /*
     * ----------------------------------------------------
     * 6. Generate embeddings
     * ----------------------------------------------------
     */

    const embeddings =
      await generateEmbeddings(
        chunks.map(
          (chunk) => chunk.content
        )
      );

    if (
      embeddings.length !==
      chunks.length
    ) {
      throw new Error(
        "Embedding count does not match chunk count."
      );
    }

    console.log(
      "🧠 EMBEDDINGS GENERATED:",
      embeddings.length
    );

    /*
     * ----------------------------------------------------
     * 7. Store chunks + embeddings
     *
     * Use a transaction here so either:
     *
     *   all chunks are stored
     *
     * OR
     *
     *   none are stored
     * ----------------------------------------------------
     */

    const client =
      await pool.connect();

    try {
      await client.query(
        "BEGIN"
      );

      for (
        let index = 0;
        index < chunks.length;
        index += 1
      ) {
        const chunk =
          chunks[index];

        const embedding =
          embeddings[index];

        await client.query(
          `
          INSERT INTO document_chunks (
            document_id,
            chunk_index,
            content,
            embedding,
            metadata
          )
          VALUES ($1, $2, $3, $4, $5)
          `,
          [
            documentId,
            chunk.chunkIndex,
            chunk.content,
            JSON.stringify(
              embedding
            ),
            JSON.stringify({})
          ]
        );
      }

      /*
       * ------------------------------------------------
       * 8. Mark document as ready
       * ------------------------------------------------
       */

      const updatedDocument =
        await client.query(
          `
          UPDATE documents
          SET
            page_count = $1,
            status = 'ready',
            updated_at = NOW(),
            error_message = NULL
          WHERE id = $2
          RETURNING
            id,
            filename,
            mime_type,
            file_size,
            file_hash,
            page_count,
            status,
            created_at,
            updated_at
          `,
          [
            extracted.pageCount,
            documentId
          ]
        );

      await client.query(
        "COMMIT"
      );

      console.log(
        "✅ DOCUMENT PROCESSING COMPLETED:",
        updatedDocument.rows[0]
      );

      /*
       * ------------------------------------------------
       * 9. Return successful result
       * ------------------------------------------------
       */

      return {
        document:
          updatedDocument.rows[0],
        chunkCount:
          chunks.length,
        duplicate: false
      };
    } catch (error) {
      await client.query(
        "ROLLBACK"
      );

      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(
      "❌ DOCUMENT PROCESSING FAILED:",
      error
    );

    /*
     * ----------------------------------------------------
     * 10. Persist failed status
     *
     * IMPORTANT:
     *
     * The document was created and committed BEFORE
     * expensive processing, therefore we can safely
     * update it to "failed".
     * ----------------------------------------------------
     */

    if (documentId) {
      try {
        await pool.query(
          `
          UPDATE documents
          SET
            status = 'failed',
            error_message = $1,
            updated_at = NOW()
          WHERE id = $2
          `,
          [
            error.message,
            documentId
          ]
        );

        console.log(
          "⚠️ DOCUMENT MARKED AS FAILED:",
          documentId
        );
      } catch (statusError) {
        console.error(
          "Failed to update document status:",
          statusError
        );
      }
    }

    /*
     * ----------------------------------------------------
     * 11. Remove uploaded physical file
     * ----------------------------------------------------
     */

    try {
      await fs.unlink(file.path);

      console.log(
        "🗑️ Uploaded file cleaned up."
      );
    } catch (cleanupError) {
      console.error(
        "Failed to remove uploaded file:",
        cleanupError
      );
    }

    throw error;
  }
}