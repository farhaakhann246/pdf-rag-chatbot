import "dotenv/config";

import { retrieveRelevantChunks } from "../services/rag/retrieval.service.js";

const query = process.argv.slice(2).join(" ");

if (!query) {
  console.error("Please provide a search query.");

  process.exit(1);
}

try {
  const results = await retrieveRelevantChunks(query, {
    topK: 5,
  });

  console.log(`Found ${results.length} results:\n`);

  for (const result of results) {
    console.log("------------------------------");

    console.log(`Chunk: ${result.chunk_index}`);

    console.log(`Document: ${result.filename}`);

    console.log(`Similarity: ${Number(result.similarity).toFixed(4)}`);

    console.log(`Content:\n${result.content}`);
  }
} catch (error) {
  console.error("Retrieval failed:", error);

  process.exit(1);
}
