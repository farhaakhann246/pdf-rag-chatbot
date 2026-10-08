const API_BASE_URL = "http://localhost:3000/api";

export async function askQuestion({ question, documentId }) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      question,
      documentId,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.error?.message || "Failed to get an answer.");
  }

  return result.data;
}
