import { generateEmbeddings as generateOpenAIEmbeddings } from "./openai.embedding.provider.js";

import { generateLocalEmbeddings } from "./local.embedding.provider.js";

import { config } from "../../config/index.js";

export async function generateEmbeddings(texts) {
  if (config.embeddingProvider === "local") {
    return generateLocalEmbeddings(texts);
  }

  return generateOpenAIEmbeddings(texts);
}
