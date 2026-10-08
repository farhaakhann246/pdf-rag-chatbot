import { retrieveRelevantChunks } from "./rag/retrieval.service.js";

import { rerankChunks } from "./rag/reranking.service.js";

import { buildRagContext } from "./rag/context.service.js";

import { generateRagAnswer } from "../providers/llm/index.js";

export async function answerQuestion(question, options = {}) {
  const { documentId = null } = options;

  if (!question?.trim()) {
    throw new Error("Question is required.");
  }

  const candidates = await retrieveRelevantChunks(question, {
    documentId,
    topK: 8,
  });

  const reranked = rerankChunks(question, candidates, {
    topK: 5,
  });

  const { context, sources } = buildRagContext(reranked);

  if (!context) {
    return {
      answer: "I could not find relevant information in the uploaded document.",
      sources: [],
    };
  }

  const answer = await generateRagAnswer({
    question,
    context,
  });

  return {
    answer,
    sources,
  };
}
