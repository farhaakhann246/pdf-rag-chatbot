import { answerQuestion } from "../services/chat.service.js";

import { chatRequestSchema } from "../utils/validation.js";

export async function chat(req, res, next) {
  try {
    const parsed = chatRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: {
          message: "Invalid chat request.",
          details: parsed.error.flatten(),
        },
      });
    }

    const { question, documentId } = parsed.data;

    const result = await answerQuestion(question, {
      documentId: documentId || null,
    });

    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
