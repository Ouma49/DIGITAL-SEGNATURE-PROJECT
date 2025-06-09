
import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  Document,
  DocumentStatus,
  SecurityLevel,
  SignatureType,
  VerificationMethod
} from '@/types/document';
import { toast } from 'sonner';
import cryptoService from '@/services/cryptoService';
import documentService from '@/services/documentService';
import blockchainService from '@/services/blockchainService';

interface DocumentContextProps {
  documents: Document[];
  isLoading: boolean;
  currentUserId: string;
  userHasKeys: boolean;
  uploadDocument: (file: File, title: string, securityLevel?: SecurityLevel) => Promise<Document | null>;
  getDocumentById: (id: string) => Document | undefined;
  signDocument: (
    documentId: string,
    signatureDataUrl: string,
    signatureMetadata?: any
  ) => Promise<boolean>;
  shareDocument: (documentId: string, email: string) => Promise<boolean>;
  verifyDocument: (documentId: string) => Promise<boolean>;
  revokeDocument: (documentId: string, reason: string) => Promise<boolean>;
  generateUserKeys: () => Promise<boolean>;
  setCurrentUserId: (userId: string) => void;
}

// Mock blockchain hash generation - more complex with different algorithms
const generateHash = () => {
  // Simulate multiple hashing algorithms (SHA-256, SHA-3, etc)
  const algorithms = ['SHA-256', 'SHA-3', 'BLAKE2'];
  const selectedAlgo = algorithms[Math.floor(Math.random() * algorithms.length)];
  
  // Generate a more complex hash
  const hash = Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  
  return `${selectedAlgo}:${hash}`;
};

// Mock blockchain transaction ID - with network identifier
const generateTxId = () => {
  const networks = ['ETH', 'BSC', 'POLYGON', 'SOLANA'];
  const network = networks[Math.floor(Math.random() * networks.length)];
  
  const txId = '0x' + Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  
  return `${network}:${txId}`;
};

// More complex verification with multiple steps
const verifyOnBlockchain = async (hash: string) => {
  // Simulate multi-step verification process
  await new Promise(resolve => setTimeout(resolve, 500)); // Step 1: Connect to network
  await new Promise(resolve => setTimeout(resolve, 700)); // Step 2: Retrieve transaction
  await new Promise(resolve => setTimeout(resolve, 300)); // Step 3: Verify hash
  
  // 95% success rate for verification
  const verified = Math.random() > 0.05;
  
  return {
    verified,
    blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
    confirmations: Math.floor(Math.random() * 50) + 1,
    networkId: Math.floor(Math.random() * 4) + 1,
    gasUsed: Math.floor(Math.random() * 200000) + 50000,
  };
};

const DocumentContext = createContext<DocumentContextProps | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUserId, setCurrentUserId] = useState<string>('demo-user');
  const [userHasKeys, setUserHasKeys] = useState<boolean>(false);

  // Load documents from local storage on mount and check for user keys
  useEffect(() => {
    const loadDocuments = () => {
      try {
        const savedDocuments = localStorage.getItem('documents');
        if (savedDocuments) {
          setDocuments(JSON.parse(savedDocuments));
        }
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const checkUserKeys = () => {
      try {
        const savedKeys = localStorage.getItem(`user-keys-${currentUserId}`);
        if (savedKeys) {
          const keyInfo = JSON.parse(savedKeys);
          setUserHasKeys(keyInfo.hasKeys || false);
        } else {
          setUserHasKeys(false);
        }
      } catch (error) {
        console.error('Error checking user keys:', error);
        setUserHasKeys(false);
      }
    };

    loadDocuments();
    checkUserKeys();
  }, [currentUserId]);

  // Save documents to local storage whenever they change
  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem('documents', JSON.stringify(documents));
    }
  }, [documents]);

  const uploadDocument = async (
    file: File,
    title: string,
    securityLevel: SecurityLevel = SecurityLevel.MEDIUM
  ): Promise<Document | null> => {
    try {
      setIsLoading(true);

      toast.info("Uploading document...");

      // Upload document using document service
      const uploadResponse = await documentService.uploadDocument({
        file,
        title: title || file.name,
        user_id: currentUserId,
        security_level: securityLevel
      });

      toast.info("Document uploaded and hashed successfully!");

      // Create document object for frontend state
      const newDocument: Document = {
        id: uploadResponse.document_id.toString(),
        title: uploadResponse.title,
        fileName: uploadResponse.filename,
        fileType: uploadResponse.file_type,
        fileData: file, // Store the file for crypto operations
        uploadedAt: uploadResponse.upload_timestamp,
        status: DocumentStatus.UPLOADED,
        hash: uploadResponse.document_hash,
        cryptoHash: uploadResponse.content_hash,
        blockchainTxId: uploadResponse.blockchain_tx_id?.toString(),
        signatures: [],
        sharedWith: [],
        securityLevel,
        metadata: {
          createdBy: "Demo User",
          createdAt: uploadResponse.upload_timestamp,
          pageCount: 1, // Will be determined by document analysis
          size: uploadResponse.file_size,
          version: 1,
          contentHash: uploadResponse.content_hash,
          signaturesRequired: securityLevel === SecurityLevel.CRITICAL ? 2 : 1
        },
        verificationHistory: [
          {
            id: Date.now().toString(),
            timestamp: uploadResponse.upload_timestamp,
            verifierId: currentUserId,
            verifierName: "Demo User",
            verified: true,
            verificationMethod: VerificationMethod.HASH_COMPARISON,
            details: "Document uploaded and hashed"
          }
        ]
      };

      setDocuments(prev => [...prev, newDocument]);
      toast.success('Document uploaded and registered on blockchain!');
      return newDocument;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getDocumentById = (id: string): Document | undefined => {
    return documents.find(doc => doc.id === id);
  };

  const generateUserKeys = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      toast.info('Generating cryptographic keys...');

      await cryptoService.generateUserKeys(currentUserId);

      const keyInfo = {
        userId: currentUserId,
        hasKeys: true,
        keyGeneratedAt: new Date().toISOString(),
      };

      localStorage.setItem(`user-keys-${currentUserId}`, JSON.stringify(keyInfo));
      setUserHasKeys(true);

      toast.success('Cryptographic keys generated successfully!');
      return true;
    } catch (error) {
      console.error('Error generating keys:', error);
      toast.error('Failed to generate cryptographic keys');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signDocument = async (
    documentId: string,
    signatureDataUrl: string,
    signatureMetadata = {}
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Get document
      const document = documents.find(doc => doc.id === documentId);
      if (!document) {
        throw new Error("Document not found");
      }

      // Check if user has keys
      if (!userHasKeys) {
        toast.error("Please generate cryptographic keys first");
        return false;
      }

      // Check if we have the original file data
      if (!document.fileData) {
        toast.error("Original document file not found. Please re-upload the document.");
        return false;
      }

      // Check if document can be signed
      if (document.status === DocumentStatus.REVOKED) {
        toast.error("This document has been revoked and cannot be signed");
        return false;
      }

      if (document.status === DocumentStatus.EXPIRED) {
        toast.error("This document has expired and cannot be signed");
        return false;
      }
      
      // Use crypto service to sign the document
      toast.info("Preparing signature for cryptographic signing...");

      // Extract base64 signature from data URL
      const signatureBase64 = cryptoService.extractBase64FromDataURL(signatureDataUrl);

      toast.info("Computing cryptographic signature...");

      // Call crypto service to sign the document
      const signedPackage = await cryptoService.signDocument({
        document: document.fileData,
        signature_base64: signatureBase64,
        user_id: currentUserId,
      });

      toast.info("Recording signature in database and blockchain...");

      // Record signature in document service
      await documentService.signDocument(parseInt(document.id), {
        user_id: currentUserId,
        signature_type: 'ELECTRONIC',
        signature_data: signatureDataUrl,
        crypto_signature: signedPackage.signature,
        algorithm: signedPackage.signing_info.algorithm,
        key_type: signedPackage.signing_info.key_type,
        metadata: signatureMetadata
      });

      toast.info("Signature completed successfully!");
      
      // Determine new document status based on required signatures
      let newStatus = DocumentStatus.SIGNED;
      
      // If document requires multiple signatures
      if (document.metadata?.signaturesRequired && document.metadata.signaturesRequired > 1) {
        const currentSignatures = (document.signatures || []).length;
        if (currentSignatures + 1 < document.metadata.signaturesRequired) {
          newStatus = DocumentStatus.PARTIALLY_SIGNED;
          toast.info(`Document requires ${document.metadata.signaturesRequired - currentSignatures - 1} more signature(s)`);
        }
      }
      
      setDocuments(prev => prev.map(doc => {
        if (doc.id === documentId) {
          const updatedSignatures = [
            ...(doc.signatures || []),
            {
              id: Date.now().toString(),
              userId: currentUserId,
              userName: 'Demo User', // In real app, this would be from auth context
              timestamp: signedPackage.timestamp,
              signatureDataUrl,
              signatureType: SignatureType.ELECTRONIC,
              verified: true,
              cryptoSignature: signedPackage.signature,
              algorithm: signedPackage.signing_info.algorithm,
              keyType: signedPackage.signing_info.key_type,
              ...signatureMetadata
            },
          ];

          const updatedVerificationHistory = [
            ...(doc.verificationHistory || []),
            {
              id: Date.now().toString(),
              timestamp: signedPackage.timestamp,
              verifierId: currentUserId,
              verifierName: 'Demo User',
              verified: true,
              verificationMethod: VerificationMethod.BLOCKCHAIN_VERIFICATION,
              details: `Cryptographic signature applied using ${signedPackage.signing_info.algorithm}`
            }
          ];

          return {
            ...doc,
            signatures: updatedSignatures,
            verificationHistory: updatedVerificationHistory,
            status: newStatus,
            cryptoHash: signedPackage.document_hash,
            signedPackage: signedPackage,
            blockchainTxId: generateTxId(),
          };
        }
        return doc;
      }));
      
      toast.success('Document signed successfully and recorded on blockchain');
      return true;
    } catch (error) {
      console.error('Error signing document:', error);
      toast.error('Failed to sign document');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const shareDocument = async (documentId: string, email: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Get document
      const document = documents.find(doc => doc.id === documentId);
      if (!document) {
        throw new Error("Document not found");
      }

      // Check if document can be shared
      if (document.status === DocumentStatus.REVOKED) {
        toast.error("This document has been revoked and cannot be shared");
        return false;
      }

      toast.info("Sharing document...");

      // Share document using document service
      const shareResponse = await documentService.shareDocument(parseInt(documentId), {
        shared_by: currentUserId,
        shared_with_email: email,
        permission_level: 'VIEW'
      });

      toast.info("Document shared successfully!");

      // Check if email is already in sharedWith list
      if (document.sharedWith?.includes(email)) {
        toast.info(`Document already shared with ${email}`);
        return true;
      }
      
      setDocuments(prev => prev.map(doc => {
        if (doc.id === documentId) {
          const updatedSharedWith = [
            ...(doc.sharedWith || []),
            email,
          ];
          
          const updatedVerificationHistory = [
            ...(doc.verificationHistory || []),
            {
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
              verifierId: '1',
              verifierName: 'Demo User',
              verified: true,
              verificationMethod: VerificationMethod.HASH_COMPARISON,
              details: `Document shared with ${email}`
            }
          ];
          
          return {
            ...doc,
            sharedWith: updatedSharedWith,
            verificationHistory: updatedVerificationHistory,
            status: DocumentStatus.SHARED,
          };
        }
        return doc;
      }));
      
      toast.success(`Document shared with ${email}`);
      return true;
    } catch (error) {
      console.error('Error sharing document:', error);
      toast.error('Failed to share document');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyDocument = async (documentId: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Get document
      const document = documents.find(doc => doc.id === documentId);
      if (!document) {
        throw new Error("Document not found");
      }

      // Check if document has been signed and has the necessary data
      if (!document.fileData || !document.signedPackage || !document.signatures || document.signatures.length === 0) {
        toast.error("Document must be signed before verification");
        return false;
      }

      toast.info("Verifying cryptographic signature...");

      // Create signed package file
      const signedPackageFile = cryptoService.createSignedPackageFile(
        document.signedPackage,
        `signed_${document.fileName}.json`
      );

      // Get the signature base64 from the first signature
      const firstSignature = document.signatures[0];
      const signatureBase64 = cryptoService.extractBase64FromDataURL(firstSignature.signatureDataUrl || '');

      // Call crypto service to verify the document
      const verificationResult = await cryptoService.verifyDocument({
        document: document.fileData,
        signed_package: signedPackageFile,
        signature_base64: signatureBase64,
      });

      if (!verificationResult.valid) {
        toast.error(`Document verification failed: ${verificationResult.message}`);
        return false;
      }
      
      setDocuments(prev => prev.map(doc => {
        if (doc.id === documentId) {
          const updatedVerificationHistory = [
            ...(doc.verificationHistory || []),
            {
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
              verifierId: currentUserId,
              verifierName: 'Demo User',
              verified: verificationResult.valid,
              verificationMethod: VerificationMethod.BLOCKCHAIN_VERIFICATION,
              details: `Cryptographic verification: ${verificationResult.message}`
            }
          ];

          return {
            ...doc,
            verificationHistory: updatedVerificationHistory,
            status: DocumentStatus.VERIFIED,
          };
        }
        return doc;
      }));
      
      toast.success('Document verified on blockchain');
      return true;
    } catch (error) {
      console.error('Error verifying document:', error);
      toast.error('Failed to verify document');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // New function to revoke documents
  const revokeDocument = async (documentId: string, reason: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Get document
      const document = documents.find(doc => doc.id === documentId);
      if (!document) {
        throw new Error("Document not found");
      }
      
      toast.info("Preparing revocation transaction...");
      await new Promise(resolve => setTimeout(resolve, 600));
      
      toast.info("Sending revocation to blockchain...");
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setDocuments(prev => prev.map(doc => {
        if (doc.id === documentId) {
          const updatedVerificationHistory = [
            ...(doc.verificationHistory || []),
            {
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
              verifierId: '1',
              verifierName: 'Demo User',
              verified: true,
              verificationMethod: VerificationMethod.BLOCKCHAIN_VERIFICATION,
              details: `Document revoked: ${reason}`
            }
          ];
          
          return {
            ...doc,
            revoked: true,
            revokedReason: reason,
            status: DocumentStatus.REVOKED,
            verificationHistory: updatedVerificationHistory,
          };
        }
        return doc;
      }));
      
      toast.success('Document has been revoked');
      return true;
    } catch (error) {
      console.error('Error revoking document:', error);
      toast.error('Failed to revoke document');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        isLoading,
        currentUserId,
        userHasKeys,
        uploadDocument,
        getDocumentById,
        signDocument,
        shareDocument,
        verifyDocument,
        revokeDocument,
        generateUserKeys,
        setCurrentUserId,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};
