import { z } from "zod";

export const chatRequestSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Question is required.")
    .max(2000, "Question is too long."),

  documentId: z.uuid().optional(),
});
