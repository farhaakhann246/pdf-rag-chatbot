export function errorMiddleware(error, req, res, next) {
  console.error(`[${req.id || "no-request-id"}]`, error);

  if (res.headersSent) {
    return next(error);
  }

  if (error?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      error: {
        message: "PDF file is too large. Maximum size is 10 MB.",
      },
    });
  }

  if (error?.message === "Only PDF files are allowed.") {
    return res.status(400).json({
      error: {
        message: error.message,
      },
    });
  }

  if (error?.status === 429 || error?.code === "credit_balance_exhausted") {
    return res.status(503).json({
      error: {
        message: "The AI service is temporarily unavailable.",
      },
    });
  }

  return res.status(500).json({
    error: {
      message: "Internal server error.",
    },
  });
}
