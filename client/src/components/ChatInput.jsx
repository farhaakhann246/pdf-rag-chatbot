import { useState } from "react";

export default function ChatInput({ onSubmit, disabled }) {
  const [question, setQuestion] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const trimmed = question.trim();

    if (!trimmed || disabled) {
      return;
    }

    onSubmit(trimmed);

    setQuestion("");
  }

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={question}
        placeholder="Ask a question about your PDF..."
        onChange={(event) => setQuestion(event.target.value)}
        disabled={disabled}
      />

      <button type="submit" disabled={disabled || !question.trim()}>
        Send
      </button>
    </form>
  );
}
