// API Configuration for different environments

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Base URLs for different environments
export const API_CONFIG = {
  // Crypto Service
  CRYPTO_SERVICE_URL: 'http://localhost/api/crypto',

  // Document Service
  DOCUMENT_SERVICE_URL: 'http://localhost/api/documents',

  // Blockchain Service
  BLOCKCHAIN_SERVICE_URL: 'http://localhost/api/blockchain',

  // Auth Service
  AUTH_SERVICE_URL: 'http://localhost/auth',
};

// Default configuration
export const DEFAULT_CONFIG = {
  // Default user for demo purposes
  DEFAULT_USER_ID: 'demo-user',
  
  // File upload limits
  MAX_FILE_SIZE: 16 * 1024 * 1024, // 16MB
  
  // Allowed file types
  ALLOWED_FILE_TYPES: ['pdf', 'doc', 'docx', 'txt', 'png', 'jpg', 'jpeg'],
  
  // Crypto settings
  CRYPTO_ALGORITHM: 'RSA-SHA256',
  KEY_SIZE: 2048,
  
  // Timeouts
  API_TIMEOUT: 30000, // 30 seconds
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
};

export default API_CONFIG;
