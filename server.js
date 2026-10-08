import "dotenv/config";

import app from "./src/app.js";

import { config } from "./src/config/index.js";

app.listen(
  config.port,
  "0.0.0.0",
  () => {
    console.log(
      `PDF RAG Chatbot running on port ${config.port}`
    );
  }
);