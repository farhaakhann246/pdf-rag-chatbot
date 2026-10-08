function tokenize(text) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean),
  );
}

function calculateKeywordScore(query, content) {
  const queryTokens = tokenize(query);

  const contentTokens = tokenize(content);

  if (queryTokens.size === 0) {
    return 0;
  }

  let matches = 0;

  for (const token of queryTokens) {
    if (contentTokens.has(token)) {
      matches += 1;
    }
  }

  return matches / queryTokens.size;
}

export function rerankChunks(query, chunks, options = {}) {
  const { topK = 5 } = options;

  if (!Array.isArray(chunks)) {
    return [];
  }

  return chunks
    .map((chunk) => {
      const vectorScore = Number(chunk.similarity) || 0;

      const keywordScore = calculateKeywordScore(query, chunk.content);

      const rerankScore = vectorScore * 0.7 + keywordScore * 0.3;

      return {
        ...chunk,
        keywordScore,
        rerankScore,
      };
    })
    .sort((a, b) => b.rerankScore - a.rerankScore)
    .slice(0, topK);
}
