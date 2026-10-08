const DEFAULT_CHUNK_SIZE = 1200;
const DEFAULT_CHUNK_OVERLAP = 200;

export function createChunks(
    text,
    chunkSize = DEFAULT_CHUNK_SIZE,
    chunkOverlap = DEFAULT_CHUNK_OVERLAP,
) {
    if (!text?.trim()) {
        return [];
    }

    if (chunkOverlap >= chunkSize) {
        throw new Error("Chunk overlap must be smaller than chunk size.");
    }

    const chunks = [];

    let start = 0;
    let chunkIndex = 0;

    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);

        const content = text.slice(start, end).trim();

        if (content) {
            chunks.push({
                chunkIndex,
                content,
            });

            chunkIndex += 1;
        }

        if (end >= text.length) {
            break;
        }

        start = end - chunkOverlap;
    }

    return chunks;
}
