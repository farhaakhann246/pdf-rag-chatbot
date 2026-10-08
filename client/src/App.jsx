import {
  useEffect,
  useState
} from "react";

import PdfUploader from "./components/PdfUploader";
import DocumentSelector from "./components/DocumentSelector";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";

import {
  getDocuments
} from "./services/document.service";

import {
  askQuestion
} from "./services/chat.service";

import "./App.css";

export default function App() {
  const [documents, setDocuments] =
    useState([]);

  const [
    selectedDocumentId,
    setSelectedDocumentId
  ] = useState("");

  const [messages, setMessages] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // Load documents when the app starts.
  useEffect(() => {
    let cancelled = false;

    async function fetchDocuments() {
      try {
        const result =
          await getDocuments();

        if (!cancelled) {
          setDocuments(result);
        }
      } catch (error) {
        if (!cancelled) {
          setError(error.message);
        }
      }
    }

    fetchDocuments();

    return () => {
      cancelled = true;
    };
  }, []);

  // Reload documents after upload.
  async function loadDocuments() {
    try {
      const result =
        await getDocuments();

      setDocuments(result);

      return result;
    } catch (error) {
      setError(error.message);
      return [];
    }
  }

  // Called by PdfUploader after a successful upload.
  async function handleUploadCompleted(
    uploadResult
  ) {
    await loadDocuments();

    if (
      uploadResult?.document?.id
    ) {
      setSelectedDocumentId(
        uploadResult.document.id
      );
    }
  }

  // Called when the user selects another document.
  function handleDocumentChange(
    documentId
  ) {
    setSelectedDocumentId(
      documentId
    );

    // Clear the previous document's
    // conversation.
    setMessages([]);

    setError("");
  }

  // Send a question to the RAG API.
  async function handleQuestion(
    question
  ) {
    if (!selectedDocumentId) {
      setError(
        "Please select a document first."
      );
      return;
    }

    setError("");

    // Immediately show the user's question.
    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: question
      }
    ]);

    setLoading(true);

    try {
      const result =
        await askQuestion({
          question,
          documentId:
            selectedDocumentId
        });

      // Add the RAG answer and sources.
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: result.answer,
          sources: result.sources
        }
      ]);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">

      <header className="app-header">
        <h1>
          PDF RAG Chatbot
        </h1>

        <p>
          Ask questions about your
          uploaded documents.
        </p>
      </header>

      <main className="app-container">

        {/* PDF Upload */}
        <section className="upload-section">
          <PdfUploader
            onUploadCompleted={
              handleUploadCompleted
            }
          />
        </section>

        {/* Document Selection */}
        <section className="document-section">
          <DocumentSelector
            documents={documents}
            selectedDocumentId={
              selectedDocumentId
            }
            onSelect={
              handleDocumentChange
            }
            disabled={loading}
          />
        </section>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Chat */}
        <section className="chat-section">
          <MessageList
            messages={messages}
          />

          <ChatInput
            onSubmit={
              handleQuestion
            }
            disabled={
              loading ||
              !selectedDocumentId
            }
          />
        </section>

      </main>
    </div>
  );
}