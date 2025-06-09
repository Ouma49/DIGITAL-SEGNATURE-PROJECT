export interface CryptoSignature {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  signatureDataUrl: string;
  signatureBase64: string;
  cryptoSignature: string; // The actual cryptographic signature
  algorithm: string;
  keyType: string;
  verified: boolean;
  blockchainTxId?: string;
}

export interface CryptoDocument {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileData?: File; // Store the actual file for crypto operations
  uploadedAt: string;
  status: CryptoDocumentStatus;
  hash: string;
  cryptoHash?: string; // Hash from crypto backend
  signatures: CryptoSignature[];
  signedPackage?: any; // The signed package from crypto backend
  verificationResult?: CryptoVerificationResult;
}

export enum CryptoDocumentStatus {
  UPLOADED = 'UPLOADED',
  KEYS_GENERATED = 'KEYS_GENERATED',
  SIGNED = 'SIGNED',
  VERIFIED = 'VERIFIED',
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
  ERROR = 'ERROR'
}

export interface CryptoVerificationResult {
  valid: boolean;
  message: string;
  timestamp?: string;
  userId?: string;
  documentHash?: string;
  signingInfo?: {
    algorithm: string;
    signatureType: string;
    keyType: string;
    keySize: number;
    signatureFormat: string;
  };
  metadata?: {
    originalFilename: string;
    contentType: string;
    fileSize: number;
  };
  nonRepudiation?: {
    documentIntegrity: string;
    signatureValidity: string;
    timestamp: string;
    keyType: string;
    algorithm: string;
  };
  error?: string;
}

export interface UserKeyInfo {
  userId: string;
  hasKeys: boolean;
  keyGeneratedAt?: string;
  publicKeyPath?: string;
  privateKeyPath?: string;
}

export interface CryptoError {
  code: string;
  message: string;
  details?: any;
}

// Utility types for API responses
export interface CryptoApiResponse<T> {
  success: boolean;
  data?: T;
  error?: CryptoError;
}

// Configuration for crypto operations
export interface CryptoConfig {
  apiBaseUrl: string;
  defaultUserId: string;
  keySize: number;
  algorithm: string;
}
