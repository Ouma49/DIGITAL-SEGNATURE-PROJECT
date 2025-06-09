-- Create documents table to store document metadata and hashes
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    document_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA-256 hash
    content_hash VARCHAR(64) NOT NULL, -- Hash of actual file content
    uploaded_by INTEGER NOT NULL,
    upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'UPLOADED',
    security_level VARCHAR(20) DEFAULT 'MEDIUM',
    blockchain_tx_id VARCHAR(100), -- Reference to blockchain transaction
    file_path TEXT, -- Path where file is stored on disk
    metadata JSONB, -- Additional metadata as JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_uploaded_by
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
        ON DELETE CASCADE
);

-- Create document_signatures table to track signatures
CREATE TABLE document_signatures (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    signature_type VARCHAR(50) NOT NULL, -- 'ELECTRONIC', 'DIGITAL', 'BIOMETRIC'
    signature_data TEXT, -- Base64 encoded signature image
    crypto_signature TEXT, -- Cryptographic signature
    algorithm VARCHAR(50), -- Signing algorithm used
    key_type VARCHAR(50), -- Type of cryptographic key
    ip_address VARCHAR(45),
    device_info TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT FALSE,
    blockchain_tx_id VARCHAR(100), -- Reference to blockchain transaction
    metadata JSONB,
    CONSTRAINT fk_doc_signature_document
        FOREIGN KEY (document_id) REFERENCES documents(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_doc_signature_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

-- Create document_actions table to track all actions on documents
CREATE TABLE document_actions (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'UPLOAD', 'SIGN', 'SEND', 'VERIFY', 'REVOKE'
    action_data JSONB, -- Additional action-specific data
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    blockchain_tx_id VARCHAR(100), -- Reference to blockchain transaction
    status VARCHAR(50) DEFAULT 'SUCCESS', -- 'SUCCESS', 'FAILED', 'PENDING'
    error_message TEXT,
    CONSTRAINT fk_doc_action_document
        FOREIGN KEY (document_id) REFERENCES documents(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_doc_action_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

-- Create document_shares table to track document sharing
CREATE TABLE document_shares (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL,
    shared_by INTEGER NOT NULL,
    shared_with_email VARCHAR(255) NOT NULL,
    shared_with_user INTEGER, -- NULL if shared with external user
    permission_level VARCHAR(50) DEFAULT 'VIEW', -- 'VIEW', 'SIGN', 'EDIT'
    share_token VARCHAR(100) UNIQUE, -- Unique token for accessing shared document
    expires_at TIMESTAMP,
    accessed_at TIMESTAMP,
    access_count INTEGER DEFAULT 0,
    blockchain_tx_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'REVOKED', 'EXPIRED'
    CONSTRAINT fk_doc_share_document
        FOREIGN KEY (document_id) REFERENCES documents(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_doc_share_shared_by
        FOREIGN KEY (shared_by) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_doc_share_shared_with
        FOREIGN KEY (shared_with_user) REFERENCES users(id)
        ON DELETE SET NULL
);

-- Create document_verification table to track verification attempts
CREATE TABLE document_verification (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL,
    verified_by INTEGER,
    verification_method VARCHAR(50) NOT NULL, -- 'HASH', 'SIGNATURE', 'BLOCKCHAIN'
    verification_result BOOLEAN NOT NULL,
    verification_data JSONB, -- Detailed verification results
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    blockchain_tx_id VARCHAR(100),
    CONSTRAINT fk_doc_verification_document
        FOREIGN KEY (document_id) REFERENCES documents(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_doc_verification_user
        FOREIGN KEY (verified_by) REFERENCES users(id)
        ON DELETE SET NULL
);

-- Create user_keys table to track cryptographic keys
CREATE TABLE user_keys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    public_key_path TEXT NOT NULL,
    private_key_path TEXT NOT NULL,
    key_algorithm VARCHAR(50) DEFAULT 'RSA',
    key_size INTEGER DEFAULT 2048,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'REVOKED', 'EXPIRED'
    CONSTRAINT fk_user_keys_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_documents_hash ON documents(document_hash);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_document_signatures_document_id ON document_signatures(document_id);
CREATE INDEX idx_document_signatures_user_id ON document_signatures(user_id);
CREATE INDEX idx_document_actions_document_id ON document_actions(document_id);
CREATE INDEX idx_document_actions_user_id ON document_actions(user_id);
CREATE INDEX idx_document_actions_type ON document_actions(action_type);
CREATE INDEX idx_document_shares_document_id ON document_shares(document_id);
CREATE INDEX idx_document_shares_token ON document_shares(share_token);
CREATE INDEX idx_document_verification_document_id ON document_verification(document_id);

-- Create triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample document statuses and types
-- These could be used for validation in the application
