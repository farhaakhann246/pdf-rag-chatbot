import fs from "fs/promises";
import { PDFParse } from "pdf-parse";

function cleanText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[^\S\n]+\n/g, "\n")
    .trim();
}

export async function extractPdfText(filePath) {
  const buffer = await fs.readFile(filePath);

  const parser = new PDFParse({
    data: buffer,
  });

  try {
    const result = await parser.getText();

    const rawText = result.text || "";
    const cleanedText = cleanText(rawText);

    return {
      rawText,
      cleanedText,
      pageCount: result.total,
    };
  } finally {
    await parser.destroy();
  }
}
