import OpenAI from "openai";

import { config } from "../../config/index.js";

let client;

function getClient() {
  if (!config.openAIKey) {
    throw new Error("OPENAI_API_KEY is required for embeddings.");
  }

  if (!client) {
    client = new OpenAI({
      apiKey: config.openAIKey,
    });
  }

  return client;
}

export async function generateEmbeddings(texts) {
  if (!Array.isArray(texts) || texts.length === 0) {
    return [];
  }

  const openAI = getClient();

  const response = await openAI.embeddings.create({
    model: config.openAIEmbeddingModel,
    input: texts,
  });

  return response.data
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);
}
