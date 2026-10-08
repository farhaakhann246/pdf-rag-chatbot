import "dotenv/config";

const port = Number(process.env.PORT) || 3000;

const databaseUrl = process.env.DATABASE_URL || "";

const openAIKey = process.env.OPENAI_API_KEY || "";

const openAIModel = process.env.OPENAI_MODEL || "gpt-4.1-mini";

const openAIEmbeddingModel =
  process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

const embeddingProvider = process.env.EMBEDDING_PROVIDER || "local";
const llmProvider = process.env.LLM_PROVIDER || "local";
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
export const config = {
  port,
  databaseUrl,
  openAIKey,
  openAIModel,
  openAIEmbeddingModel,
  embeddingProvider,
  llmProvider,
  clientUrl
};
