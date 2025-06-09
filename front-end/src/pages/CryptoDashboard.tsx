import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Key, 
  FileText, 
  Upload, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Clock,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { useCrypto } from '@/contexts/CryptoContext';
import { CryptoDocumentStatus } from '@/types/crypto';
import { toast } from 'sonner';

const CryptoDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    documents, 
    userKeys, 
    isLoading, 
    currentUserId,
    generateUserKeys,
    addDocument 
  } = useCrypto();
  
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState('');

  const handleGenerateKeys = async () => {
    const success = await generateUserKeys();
    if (success) {
      toast.success('Cryptographic keys generated! You can now sign documents.');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(file);
    setDocumentTitle(file.name);
  };

  const handleAddDocument = async () => {
    if (!uploadingFile) return;

    const document = await addDocument(uploadingFile, documentTitle);
    if (document) {
      setUploadingFile(null);
      setDocumentTitle('');
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const getStatusIcon = (status: CryptoDocumentStatus) => {
    switch (status) {
      case CryptoDocumentStatus.UPLOADED:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case CryptoDocumentStatus.SIGNED:
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case CryptoDocumentStatus.VERIFIED:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case CryptoDocumentStatus.VERIFICATION_FAILED:
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: CryptoDocumentStatus) => {
    switch (status) {
      case CryptoDocumentStatus.UPLOADED:
        return 'bg-yellow-100 text-yellow-800';
      case CryptoDocumentStatus.SIGNED:
        return 'bg-blue-100 text-blue-800';
      case CryptoDocumentStatus.VERIFIED:
        return 'bg-green-100 text-green-800';
      case CryptoDocumentStatus.VERIFICATION_FAILED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Crypto Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your cryptographic keys and sign documents securely
          </p>
        </div>

        {/* User Keys Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Cryptographic Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">User ID: {currentUserId}</p>
                <p className="text-sm text-muted-foreground">
                  {userKeys?.hasKeys 
                    ? `Keys generated on ${new Date(userKeys.keyGeneratedAt || '').toLocaleDateString()}`
                    : 'No cryptographic keys found'
                  }
                </p>
              </div>
              <div className="flex items-center gap-4">
                {userKeys?.hasKeys ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Keys Available
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">
                    <XCircle className="h-3 w-3 mr-1" />
                    No Keys
                  </Badge>
                )}
                {!userKeys?.hasKeys && (
                  <Button onClick={handleGenerateKeys} disabled={isLoading}>
                    {isLoading ? 'Generating...' : 'Generate Keys'}
                  </Button>
                )}
              </div>
            </div>
            
            {!userKeys?.hasKeys && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Keys Required</AlertTitle>
                <AlertDescription>
                  You need to generate cryptographic keys before you can sign documents. 
                  This creates a unique RSA key pair for secure document signing.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Upload Document Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label htmlFor="file-upload" className="block text-sm font-medium mb-2">
                  Select Document
                </label>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  accept=".pdf,.doc,.docx,.txt"
                />
              </div>
              
              {uploadingFile && (
                <div>
                  <label htmlFor="document-title" className="block text-sm font-medium mb-2">
                    Document Title
                  </label>
                  <input
                    id="document-title"
                    type="text"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter document title"
                  />
                </div>
              )}
              
              {uploadingFile && (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{uploadingFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(uploadingFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button onClick={handleAddDocument} disabled={isLoading || !documentTitle.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Document
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents ({documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No documents uploaded yet</p>
                <p className="text-sm text-muted-foreground">Upload a document to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((document) => (
                  <div key={document.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="font-medium">{document.title}</h3>
                          <p className="text-sm text-muted-foreground">{document.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge className={getStatusColor(document.status)}>
                            {getStatusIcon(document.status)}
                            <span className="ml-1">{document.status}</span>
                          </Badge>
                          {document.signatures.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {document.signatures.length} signature(s)
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {document.status === CryptoDocumentStatus.UPLOADED && userKeys?.hasKeys && (
                            <Button 
                              size="sm" 
                              onClick={() => navigate(`/crypto/sign/${document.id}`)}
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              Sign
                            </Button>
                          )}
                          
                          {document.status === CryptoDocumentStatus.SIGNED && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/crypto/verify/${document.id}`)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                          )}
                          
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => navigate(`/crypto/details/${document.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CryptoDashboard;
