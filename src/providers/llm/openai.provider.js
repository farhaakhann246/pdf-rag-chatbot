import OpenAI from "openai";

import { config } from "../../config/index.js";

import { RAG_SYSTEM_INSTRUCTIONS } from "./rag.instructions.js";

let client;

function getClient() {
  if (!config.openAIKey) {
    throw new Error("OPENAI_API_KEY is required for RAG generation.");
  }

  if (!client) {
    client = new OpenAI({
      apiKey: config.openAIKey,
    });
  }

  return client;
}

export async function generateRagAnswer({ question, context }) {
  if (!question?.trim()) {
    throw new Error("Question is required.");
  }

  if (!context?.trim()) {
    throw new Error("RAG context is required.");
  }

  const openAI = getClient();

  const response = await openAI.responses.create({
    model: config.openAIModel,

    instructions: RAG_SYSTEM_INSTRUCTIONS,

    input: `
DOCUMENT CONTEXT
================

${context}

END DOCUMENT CONTEXT


USER QUESTION
================

${question}
`,
  });

  return response.output_text?.trim() || "";
}
