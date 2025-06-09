import axios from 'axios';
import { API_CONFIG } from '@/config/api';

// Configure the base URL for the crypto backend
const CRYPTO_API_BASE_URL = API_CONFIG.CRYPTO_SERVICE_URL;

// Create axios instance with default config
const cryptoApi = axios.create({
  baseURL: CRYPTO_API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export interface SignDocumentRequest {
  document: File;
  signature_base64: string;
  user_id: string;
}

export interface SignDocumentResponse {
  timestamp: string;
  signature: string;
  hash_algorithm: string;
  user_id: string;
  signed_data: {
    document: string;
    signature_image: string;
    timestamp: string;
    user_id: string;
  };
  document_hash: string;
  signing_info: {
    algorithm: string;
    signature_type: string;
    key_type: string;
    key_size: number;
    signature_format: string;
  };
  metadata: {
    original_filename: string;
    content_type: string;
    file_size: number;
  };
}

export interface VerifyDocumentRequest {
  document: File;
  signed_package: File;
  signature_base64: string;
}

export interface VerifyDocumentResponse {
  valid: boolean;
  message: string;
  details: {
    user_id?: string;
    timestamp?: string;
    document_hash?: string;
    signing_info?: any;
    metadata?: any;
    non_repudiation?: {
      document_integrity: string;
      signature_validity: string;
      timestamp: string;
      key_type: string;
      algorithm: string;
    };
    error?: string;
  };
}

export interface GenerateKeysResponse {
  message: string;
}

class CryptoService {
  /**
   * Generate cryptographic keys for a user
   */
  async generateUserKeys(userId: string): Promise<GenerateKeysResponse> {
    try {
      const response = await cryptoApi.post(`/users/${userId}/keys`);
      return response.data;
    } catch (error) {
      console.error('Error generating user keys:', error);
      throw new Error('Failed to generate user keys');
    }
  }

  /**
   * Sign a document using the crypto backend
   */
  async signDocument(request: SignDocumentRequest): Promise<SignDocumentResponse> {
    try {
      const formData = new FormData();
      formData.append('document', request.document);
      formData.append('signature_base64', request.signature_base64);
      formData.append('user_id', request.user_id);

      const response = await cryptoApi.post('/sign', formData);
      return response.data;
    } catch (error) {
      console.error('Error signing document:', error);
      throw new Error('Failed to sign document');
    }
  }

  /**
   * Verify a signed document using the crypto backend
   */
  async verifyDocument(request: VerifyDocumentRequest): Promise<VerifyDocumentResponse> {
    try {
      const formData = new FormData();
      formData.append('document', request.document);
      formData.append('signed_package', request.signed_package);
      formData.append('signature_base64', request.signature_base64);

      const response = await cryptoApi.post('/verify', formData);
      return response.data;
    } catch (error) {
      console.error('Error verifying document:', error);
      throw new Error('Failed to verify document');
    }
  }

  /**
   * Convert a data URL to a File object
   */
  dataURLtoFile(dataURL: string, filename: string): File {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  /**
   * Create a signed package file from the response
   */
  createSignedPackageFile(signedPackage: SignDocumentResponse, filename: string): File {
    const jsonString = JSON.stringify(signedPackage, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    return new File([blob], filename, { type: 'application/json' });
  }

  /**
   * Extract base64 signature from data URL
   */
  extractBase64FromDataURL(dataURL: string): string {
    return dataURL.split(',')[1];
  }
}

export const cryptoService = new CryptoService();
export default cryptoService;
