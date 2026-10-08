import "dotenv/config";

import { retrieveRelevantChunks } from "../services/rag/retrieval.service.js";

import { rerankChunks } from "../services/rag/reranking.service.js";

import { buildRagContext } from "../services/rag/context.service.js";

const query = process.argv.slice(2).join(" ");

if (!query) {
  console.error("Please provide a search query.");

  process.exit(1);
}

try {
  const candidates = await retrieveRelevantChunks(query, {
    topK: 8,
  });

  const reranked = rerankChunks(query, candidates, {
    topK: 5,
  });

  const { context, sources } = buildRagContext(reranked);

  console.log("\n===== RAG CONTEXT =====\n");

  console.log(context);

  console.log("\n===== SOURCES =====\n");

  console.log(JSON.stringify(sources, null, 2));
} catch (error) {
  console.error("Context test failed:", error);

  process.exit(1);
}
