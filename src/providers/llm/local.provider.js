export async function generateLocalRagAnswer({ question, context }) {
  if (!question?.trim()) {
    throw new Error("Question is required.");
  }

  if (!context?.trim()) {
    throw new Error("RAG context is required.");
  }

  const sourceBlocks = context.split("\n\n------------------------------\n\n");

  const normalizedQuestion = question
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const scoredBlocks = sourceBlocks.map((block) => {
    const normalizedBlock = block.toLowerCase();

    let score = 0;

    for (const word of normalizedQuestion) {
      if (word.length > 2 && normalizedBlock.includes(word)) {
        score += 1;
      }
    }

    return {
      block,
      score,
    };
  });

  scoredBlocks.sort((a, b) => b.score - a.score);

  const bestBlock = scoredBlocks[0];

  if (!bestBlock || bestBlock.score === 0) {
    return (
      "I could not find relevant " + "information in the provided document."
    );
  }

  const content = bestBlock.block
    .split("\n")
    .filter(
      (line) =>
        !line.startsWith("[SOURCE") &&
        !line.startsWith("Document:") &&
        !line.startsWith("Chunk:") &&
        !line.startsWith("Page:"),
    )
    .join("\n")
    .trim();

  return `Based on the retrieved document context:\n\n` + content;
}
