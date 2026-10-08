import { useState } from "react";

import { uploadDocument } from "../services/document.service";

export default function PdfUploader({ onUploadCompleted }) {
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    setFile(selectedFile || null);
    setError("");
    setMessage("");
  }

  async function handleUpload() {
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const result = await uploadDocument(file);

      if (result?.duplicate) {
        setMessage(
          result.message || "This document has already been uploaded.",
        );
      } else {
        setMessage("PDF uploaded and processed successfully.");
      }

      // Tell App.jsx about the uploaded
      // or existing document.
      onUploadCompleted?.(result);

      setFile(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pdf-uploader">
      <h2>Upload PDF</h2>

      <div className="upload-controls">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={loading}
        />

        <button
          type="button"
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading ? "Processing..." : "Upload PDF"}
        </button>
      </div>

      {message && <div className="success-message">{message}</div>}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
