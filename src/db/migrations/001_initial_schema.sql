CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE EXTENSION IF NOT EXISTS vector;


CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    filename TEXT NOT NULL,

    mime_type TEXT NOT NULL,

    file_size INTEGER NOT NULL,

    page_count INTEGER,

    status TEXT NOT NULL DEFAULT 'processing',

    error_message TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT documents_status_check
        CHECK (
            status IN (
                'processing',
                'ready',
                'failed'
            )
        ),

    CONSTRAINT documents_file_size_check
        CHECK (
            file_size > 0
        )
);


CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    document_id UUID NOT NULL,

    chunk_index INTEGER NOT NULL,

    content TEXT NOT NULL,

    page_number INTEGER,

    token_count INTEGER,

    embedding VECTOR(1536),

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT document_chunks_document_fk
        FOREIGN KEY (document_id)
        REFERENCES documents(id)
        ON DELETE CASCADE,

    CONSTRAINT document_chunks_index_check
        CHECK (
            chunk_index >= 0
        ),

    CONSTRAINT document_chunks_content_check
        CHECK (
            LENGTH(TRIM(content)) > 0
        ),

    CONSTRAINT document_chunks_token_count_check
        CHECK (
            token_count IS NULL
            OR token_count > 0
        ),

    CONSTRAINT document_chunks_unique_index
        UNIQUE (
            document_id,
            chunk_index
        )
);

CREATE INDEX IF NOT EXISTS idx_documents_status
    ON documents(status);


CREATE INDEX IF NOT EXISTS idx_documents_created_at
    ON documents(created_at DESC);


CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id
    ON document_chunks(document_id);


CREATE INDEX IF NOT EXISTS idx_document_chunks_page_number
    ON document_chunks(document_id, page_number);


CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding
    ON document_chunks
    USING hnsw (embedding vector_cosine_ops);