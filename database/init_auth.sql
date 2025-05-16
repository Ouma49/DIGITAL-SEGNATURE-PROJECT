-- Create roles table (without timestamps)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role VARCHAR(255) NOT NULL UNIQUE
);

-- Create users table with timestamps and password change tracking
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL,
    organization_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_role
        FOREIGN KEY (role_id) REFERENCES roles(id)
        ON DELETE SET NULL
);

-- Create login_history table to track login attempts
CREATE TABLE login_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    ip_address VARCHAR(45),
    CONSTRAINT fk_login_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);


-- Insert sample roles
INSERT INTO roles (id, role) VALUES (1, 'admin');
INSERT INTO roles (id, role) VALUES (2, 'user');

