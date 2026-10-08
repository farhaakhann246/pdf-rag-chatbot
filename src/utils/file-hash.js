import crypto from "crypto";
import fs from "fs/promises";

export async function calculateFileHash(filePath) {
  const fileBuffer = await fs.readFile(filePath);

   const hash = crypto
    .createHash("sha256")
    .update(fileBuffer)
    .digest("hex");

  return hash;

}