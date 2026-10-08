import { pool } from "../db/pool.js";
import { processDocumentUpload } from "../services/document.service.js";

export async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: {
          message: "PDF file is required."
        }
      });
    }

    const result =
      await processDocumentUpload(req.file);

    return res.status(201).json({
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function listDocuments(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT
        id,
        filename,
        mime_type,
        file_size,
        file_hash,
        page_count,
        status,
        error_message,
        created_at,
        updated_at
      FROM documents
      ORDER BY created_at DESC
    `);

    return res.status(200).json({
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
}