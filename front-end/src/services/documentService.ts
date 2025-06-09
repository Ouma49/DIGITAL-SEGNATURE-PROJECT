import axios from 'axios';
import { API_CONFIG } from '@/config/api';

// Configure the base URL for the document service
const DOCUMENT_API_BASE_URL = API_CONFIG.DOCUMENT_SERVICE_URL;

// Create axios instance with default config
const documentApi = axios.create({
  baseURL: DOCUMENT_API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export interface DocumentUploadRequest {
  file: File;
  title: string;
  user_id: string;
  security_level?: string;
}

export interface DocumentUploadResponse {
  document_id: number;
  title: string;
  filename: string;
  file_type: string;
  file_size: number;
  document_hash: string;
  content_hash: string;
  upload_timestamp: string;
  blockchain_tx_id: number;
  status: string;
}

export interface DocumentMetadata {
  id: number;
  title: string;
  filename: string;
  file_type: string;
  file_size: number;
  document_hash: string;
  content_hash: string;
  uploaded_by: number;
  uploaded_by_name: string;
  upload_timestamp: string;
  status: string;
  security_level: string;
  blockchain_tx_id: string;
  file_path: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface DocumentSignRequest {
  user_id: string;
  signature_type: string;
  signature_data: string;
  crypto_signature: string;
  algorithm: string;
  key_type: string;
  metadata?: any;
}

export interface DocumentSignResponse {
  signature_id: number;
  document_id: number;
  timestamp: string;
  blockchain_tx_id: number;
  status: string;
}

export interface DocumentShareRequest {
  shared_by: string;
  shared_with_email: string;
  permission_level?: string;
}

export interface DocumentShareResponse {
  share_id: number;
  document_id: number;
  share_token: string;
  shared_with: string;
  permission_level: string;
  timestamp: string;
  blockchain_tx_id: number;
  status: string;
}

class DocumentService {
  /**
   * Upload a document to the document service
   */
  async uploadDocument(request: DocumentUploadRequest): Promise<DocumentUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', request.file);
      formData.append('title', request.title);
      formData.append('user_id', request.user_id);
      if (request.security_level) {
        formData.append('security_level', request.security_level);
      }

      const response = await documentApi.post('/documents/upload', formData);
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw new Error('Failed to upload document');
    }
  }

  /**
   * Get document metadata by ID
   */
  async getDocument(documentId: number): Promise<DocumentMetadata> {
    try {
      const response = await documentApi.get(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting document:', error);
      throw new Error('Failed to get document');
    }
  }

  /**
   * Get all documents for a user
   */
  async getUserDocuments(userId: number): Promise<DocumentMetadata[]> {
    try {
      const response = await documentApi.get(`/documents/user/${userId}`);
      return response.data.documents;
    } catch (error) {
      console.error('Error getting user documents:', error);
      throw new Error('Failed to get user documents');
    }
  }

  /**
   * Download a document file
   */
  async downloadDocument(documentId: number): Promise<Blob> {
    try {
      const response = await documentApi.get(`/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading document:', error);
      throw new Error('Failed to download document');
    }
  }

  /**
   * Sign a document
   */
  async signDocument(documentId: number, request: DocumentSignRequest): Promise<DocumentSignResponse> {
    try {
      const response = await documentApi.post(`/documents/${documentId}/sign`, request, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error signing document:', error);
      throw new Error('Failed to sign document');
    }
  }

  /**
   * Share a document
   */
  async shareDocument(documentId: number, request: DocumentShareRequest): Promise<DocumentShareResponse> {
    try {
      const response = await documentApi.post(`/documents/${documentId}/share`, request, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error sharing document:', error);
      throw new Error('Failed to share document');
    }
  }

  /**
   * Get document download URL
   */
  getDownloadUrl(documentId: number): string {
    return `${DOCUMENT_API_BASE_URL}/documents/${documentId}/download`;
  }

  /**
   * Check service health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await documentApi.get('/health');
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('Document service health check failed:', error);
      return false;
    }
  }
}

export const documentService = new DocumentService();
export default documentService;
