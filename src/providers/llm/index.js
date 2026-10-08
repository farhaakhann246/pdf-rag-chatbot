import { generateRagAnswer as generateOpenAIRagAnswer } from "./openai.provider.js";

import { generateLocalRagAnswer } from "./local.provider.js";

import { config } from "../../config/index.js";

export async function generateRagAnswer(payload) {
  if (config.llmProvider === "local") {
    return generateLocalRagAnswer(payload);
  }

  if (config.llmProvider === "openai") {
    return generateOpenAIRagAnswer(payload);
  }

  throw new Error(`Unsupported LLM provider: ${config.llmProvider}`);
}
