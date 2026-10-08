ALTER TABLE documents
ADD CONSTRAINT documents_file_hash_unique
UNIQUE (file_hash);