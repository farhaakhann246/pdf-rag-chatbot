import "dotenv/config";

import { retrieveRelevantChunks } from "../services/rag/retrieval.service.js";

import { rerankChunks } from "../services/rag/reranking.service.js";

const query = process.argv.slice(2).join(" ");

if (!query) {
  console.error("Please provide a search query.");

  process.exit(1);
}

try {
  const candidates = await retrieveRelevantChunks(query, {
    topK: 8,
  });

  const results = rerankChunks(query, candidates, {
    topK: 5,
  });

  console.log(`Retrieved ${candidates.length} candidates.`);

  console.log(`After reranking: ${results.length}\n`);

  for (const result of results) {
    console.log("------------------------------");

    console.log(`Chunk: ${result.chunk_index}`);

    console.log(`Vector similarity: ${Number(result.similarity).toFixed(4)}`);

    console.log(`Keyword score: ${result.keywordScore.toFixed(4)}`);

    console.log(`Rerank score: ${result.rerankScore.toFixed(4)}`);

    console.log(`Content:\n${result.content}`);
  }
} catch (error) {
  console.error("Reranking failed:", error);

  process.exit(1);
}
