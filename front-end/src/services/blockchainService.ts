import axios from 'axios';
import { API_CONFIG } from '@/config/api';

// Configure the base URL for the blockchain service
const BLOCKCHAIN_API_BASE_URL = API_CONFIG.BLOCKCHAIN_SERVICE_URL;

// Create axios instance with default config
const blockchainApi = axios.create({
  baseURL: BLOCKCHAIN_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface BlockchainAction {
  action_type: 'UPLOAD' | 'SIGN' | 'SEND' | 'VERIFY' | 'REVOKE';
  user_id: number;
  timestamp: string;
  document_id?: number;
  action_data?: any;
}

export interface BlockchainActionResponse {
  block_id: number;
  hash: string;
  action_type: string;
  timestamp: string;
}

export interface BlockData {
  block_id: number;
  previous_hash: string;
  data: any;
  hash: string;
  timestamp: string;
  action_type: string;
  user_id: number;
  document_id: number;
}

export interface DocumentHistory {
  document_id: number;
  history: Array<{
    block_id: number;
    data: any;
    hash: string;
    timestamp: string;
    action_type: string;
    user_id: number;
  }>;
}

export interface UserActions {
  user_id: number;
  actions: Array<{
    block_id: number;
    data: any;
    hash: string;
    timestamp: string;
    action_type: string;
    document_id: number;
  }>;
}

export interface BlockchainVerification {
  valid: boolean;
  message: string;
  total_blocks?: number;
  block_id?: number;
}

export interface BlockchainStats {
  total_blocks: number;
  actions_by_type: Record<string, number>;
  recent_activity: Array<{
    action: string;
    timestamp: string;
  }>;
}

class BlockchainService {
  /**
   * Record an action on the blockchain
   */
  async recordAction(action: BlockchainAction): Promise<BlockchainActionResponse> {
    try {
      const response = await blockchainApi.post('/blockchain/action', action);
      return response.data;
    } catch (error) {
      console.error('Error recording blockchain action:', error);
      throw new Error('Failed to record blockchain action');
    }
  }

  /**
   * Get a specific block by ID
   */
  async getBlock(blockId: number): Promise<BlockData> {
    try {
      const response = await blockchainApi.get(`/blockchain/block/${blockId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting block:', error);
      throw new Error('Failed to get block');
    }
  }

  /**
   * Get document history from blockchain
   */
  async getDocumentHistory(documentId: number): Promise<DocumentHistory> {
    try {
      const response = await blockchainApi.get(`/blockchain/document/${documentId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error getting document history:', error);
      throw new Error('Failed to get document history');
    }
  }

  /**
   * Get user actions from blockchain
   */
  async getUserActions(userId: number): Promise<UserActions> {
    try {
      const response = await blockchainApi.get(`/blockchain/user/${userId}/actions`);
      return response.data;
    } catch (error) {
      console.error('Error getting user actions:', error);
      throw new Error('Failed to get user actions');
    }
  }

  /**
   * Verify blockchain integrity
   */
  async verifyBlockchain(): Promise<BlockchainVerification> {
    try {
      const response = await blockchainApi.get('/blockchain/verify');
      return response.data;
    } catch (error) {
      console.error('Error verifying blockchain:', error);
      throw new Error('Failed to verify blockchain');
    }
  }

  /**
   * Get blockchain statistics
   */
  async getStats(): Promise<BlockchainStats> {
    try {
      const response = await blockchainApi.get('/blockchain/stats');
      return response.data;
    } catch (error) {
      console.error('Error getting blockchain stats:', error);
      throw new Error('Failed to get blockchain stats');
    }
  }

  /**
   * Record document upload action
   */
  async recordUpload(userId: number, documentId: number, metadata: any): Promise<BlockchainActionResponse> {
    return this.recordAction({
      action_type: 'UPLOAD',
      user_id: userId,
      timestamp: new Date().toISOString(),
      document_id: documentId,
      action_data: metadata
    });
  }

  /**
   * Record document signing action
   */
  async recordSign(userId: number, documentId: number, signatureData: any): Promise<BlockchainActionResponse> {
    return this.recordAction({
      action_type: 'SIGN',
      user_id: userId,
      timestamp: new Date().toISOString(),
      document_id: documentId,
      action_data: signatureData
    });
  }

  /**
   * Record document sharing action
   */
  async recordShare(userId: number, documentId: number, shareData: any): Promise<BlockchainActionResponse> {
    return this.recordAction({
      action_type: 'SEND',
      user_id: userId,
      timestamp: new Date().toISOString(),
      document_id: documentId,
      action_data: shareData
    });
  }

  /**
   * Record document verification action
   */
  async recordVerify(userId: number, documentId: number, verificationData: any): Promise<BlockchainActionResponse> {
    return this.recordAction({
      action_type: 'VERIFY',
      user_id: userId,
      timestamp: new Date().toISOString(),
      document_id: documentId,
      action_data: verificationData
    });
  }

  /**
   * Check service health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await blockchainApi.get('/blockchain/stats');
      return response.status === 200;
    } catch (error) {
      console.error('Blockchain service health check failed:', error);
      return false;
    }
  }
}

export const blockchainService = new BlockchainService();
export default blockchainService;
