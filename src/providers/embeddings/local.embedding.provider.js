import crypto from "crypto";

const EMBEDDING_DIMENSIONS = 1536;

function generateVector(text) {
  const vector = new Array(EMBEDDING_DIMENSIONS);

  let seed = crypto.createHash("sha256").update(text).digest();

  for (let index = 0; index < EMBEDDING_DIMENSIONS; index += 1) {
    if (index % 32 === 0) {
      seed = crypto.createHash("sha256").update(seed).digest();
    }

    const byte = seed[index % seed.length];

    vector[index] = (byte / 255) * 2 - 1;
  }

  return vector;
}

export async function generateLocalEmbeddings(texts) {
  if (!Array.isArray(texts) || texts.length === 0) {
    return [];
  }

  return texts.map((text) => generateVector(text));
}
