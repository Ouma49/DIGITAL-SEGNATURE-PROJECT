import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import cryptoService, { SignDocumentResponse, VerifyDocumentResponse } from '@/services/cryptoService';
import { 
  CryptoDocument, 
  CryptoDocumentStatus, 
  CryptoVerificationResult,
  UserKeyInfo,
  CryptoSignature 
} from '@/types/crypto';

interface CryptoContextProps {
  documents: CryptoDocument[];
  userKeys: UserKeyInfo | null;
  isLoading: boolean;
  currentUserId: string;
  
  // Key management
  generateUserKeys: () => Promise<boolean>;
  checkUserKeys: () => Promise<boolean>;
  
  // Document operations
  addDocument: (file: File, title: string) => Promise<CryptoDocument | null>;
  signDocument: (documentId: string, signatureDataUrl: string) => Promise<boolean>;
  verifyDocument: (documentId: string) => Promise<boolean>;
  getDocumentById: (id: string) => CryptoDocument | undefined;
  
  // Utility functions
  setCurrentUserId: (userId: string) => void;
}

const CryptoContext = createContext<CryptoContextProps | undefined>(undefined);

export const CryptoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<CryptoDocument[]>([]);
  const [userKeys, setUserKeys] = useState<UserKeyInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string>('demo-user'); // Default user ID

  // Load documents from localStorage on mount
  useEffect(() => {
    const loadDocuments = () => {
      try {
        const savedDocuments = localStorage.getItem('crypto-documents');
        if (savedDocuments) {
          setDocuments(JSON.parse(savedDocuments));
        }
      } catch (error) {
        console.error('Error loading crypto documents:', error);
      }
    };

    loadDocuments();
    checkUserKeys();
  }, [currentUserId]);

  // Save documents to localStorage whenever they change
  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem('crypto-documents', JSON.stringify(documents));
    }
  }, [documents]);

  const generateUserKeys = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      toast.info('Generating cryptographic keys...');
      
      await cryptoService.generateUserKeys(currentUserId);
      
      const keyInfo: UserKeyInfo = {
        userId: currentUserId,
        hasKeys: true,
        keyGeneratedAt: new Date().toISOString(),
      };
      
      setUserKeys(keyInfo);
      localStorage.setItem(`user-keys-${currentUserId}`, JSON.stringify(keyInfo));
      
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

  const checkUserKeys = async (): Promise<boolean> => {
    try {
      // Check localStorage first
      const savedKeys = localStorage.getItem(`user-keys-${currentUserId}`);
      if (savedKeys) {
        const keyInfo = JSON.parse(savedKeys);
        setUserKeys(keyInfo);
        return keyInfo.hasKeys;
      }
      
      // If no keys in localStorage, assume no keys exist
      setUserKeys({
        userId: currentUserId,
        hasKeys: false,
      });
      return false;
    } catch (error) {
      console.error('Error checking user keys:', error);
      return false;
    }
  };

  const addDocument = async (file: File, title: string): Promise<CryptoDocument | null> => {
    try {
      setIsLoading(true);
      
      // Create document hash (simple client-side hash for now)
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      const newDocument: CryptoDocument = {
        id: Date.now().toString(),
        title: title || file.name,
        fileName: file.name,
        fileType: file.type,
        fileData: file,
        uploadedAt: new Date().toISOString(),
        status: CryptoDocumentStatus.UPLOADED,
        hash,
        signatures: [],
      };
      
      setDocuments(prev => [...prev, newDocument]);
      toast.success('Document added successfully');
      return newDocument;
    } catch (error) {
      console.error('Error adding document:', error);
      toast.error('Failed to add document');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const signDocument = async (documentId: string, signatureDataUrl: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const document = documents.find(doc => doc.id === documentId);
      if (!document || !document.fileData) {
        throw new Error('Document not found or file data missing');
      }

      if (!userKeys?.hasKeys) {
        toast.error('Please generate cryptographic keys first');
        return false;
      }

      toast.info('Signing document with cryptographic signature...');
      
      // Extract base64 signature from data URL
      const signatureBase64 = cryptoService.extractBase64FromDataURL(signatureDataUrl);
      
      // Call crypto service to sign the document
      const signedPackage: SignDocumentResponse = await cryptoService.signDocument({
        document: document.fileData,
        signature_base64: signatureBase64,
        user_id: currentUserId,
      });

      // Create crypto signature object
      const cryptoSignature: CryptoSignature = {
        id: Date.now().toString(),
        userId: currentUserId,
        userName: 'Demo User', // In real app, get from auth context
        timestamp: signedPackage.timestamp,
        signatureDataUrl,
        signatureBase64,
        cryptoSignature: signedPackage.signature,
        algorithm: signedPackage.signing_info.algorithm,
        keyType: signedPackage.signing_info.key_type,
        verified: true,
      };

      // Update document with signature and signed package
      setDocuments(prev => prev.map(doc => {
        if (doc.id === documentId) {
          return {
            ...doc,
            status: CryptoDocumentStatus.SIGNED,
            signatures: [...doc.signatures, cryptoSignature],
            signedPackage,
            cryptoHash: signedPackage.document_hash,
          };
        }
        return doc;
      }));

      toast.success('Document signed successfully with cryptographic signature!');
      return true;
    } catch (error) {
      console.error('Error signing document:', error);
      toast.error('Failed to sign document');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyDocument = async (documentId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const document = documents.find(doc => doc.id === documentId);
      if (!document || !document.fileData || !document.signedPackage) {
        throw new Error('Document not found, missing file data, or not signed');
      }

      toast.info('Verifying document cryptographic signature...');
      
      // Create signed package file
      const signedPackageFile = cryptoService.createSignedPackageFile(
        document.signedPackage,
        `signed_${document.fileName}.json`
      );

      // Get the signature base64 from the first signature
      const firstSignature = document.signatures[0];
      if (!firstSignature) {
        throw new Error('No signature found for verification');
      }

      // Call crypto service to verify the document
      const verificationResult: VerifyDocumentResponse = await cryptoService.verifyDocument({
        document: document.fileData,
        signed_package: signedPackageFile,
        signature_base64: firstSignature.signatureBase64,
      });

      // Create verification result object
      const cryptoVerificationResult: CryptoVerificationResult = {
        valid: verificationResult.valid,
        message: verificationResult.message,
        timestamp: verificationResult.details.timestamp,
        userId: verificationResult.details.user_id,
        documentHash: verificationResult.details.document_hash,
        signingInfo: verificationResult.details.signing_info,
        metadata: verificationResult.details.metadata,
        nonRepudiation: verificationResult.details.non_repudiation,
        error: verificationResult.details.error,
      };

      // Update document with verification result
      setDocuments(prev => prev.map(doc => {
        if (doc.id === documentId) {
          return {
            ...doc,
            status: verificationResult.valid ? CryptoDocumentStatus.VERIFIED : CryptoDocumentStatus.VERIFICATION_FAILED,
            verificationResult: cryptoVerificationResult,
          };
        }
        return doc;
      }));

      if (verificationResult.valid) {
        toast.success('Document verification successful!');
      } else {
        toast.error(`Document verification failed: ${verificationResult.message}`);
      }

      return verificationResult.valid;
    } catch (error) {
      console.error('Error verifying document:', error);
      toast.error('Failed to verify document');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getDocumentById = (id: string): CryptoDocument | undefined => {
    return documents.find(doc => doc.id === id);
  };

  return (
    <CryptoContext.Provider
      value={{
        documents,
        userKeys,
        isLoading,
        currentUserId,
        generateUserKeys,
        checkUserKeys,
        addDocument,
        signDocument,
        verifyDocument,
        getDocumentById,
        setCurrentUserId,
      }}
    >
      {children}
    </CryptoContext.Provider>
  );
};

export const useCrypto = () => {
  const context = useContext(CryptoContext);
  if (!context) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
};
