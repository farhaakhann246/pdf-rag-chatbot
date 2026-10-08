const API_BASE_URL = "http://localhost:3000/api";

export async function uploadDocument(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/documents`, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.error?.message || "Failed to upload document.");
  }

  return result.data;
}

export async function getDocuments() {
  const response = await fetch(`${API_BASE_URL}/documents`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.error?.message || "Failed to load documents.");
  }

  return result.data;
}
