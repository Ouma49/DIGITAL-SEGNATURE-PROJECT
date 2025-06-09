
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { useDocuments } from '@/contexts/DocumentContext';
import { useAuth } from '@/contexts/AuthContext';
import DocumentCard from '@/components/DocumentCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Key, Shield, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard: React.FC = () => {
  const { documents, isLoading, userHasKeys, currentUserId, generateUserKeys } = useDocuments();
  const { authState } = useAuth();
  const navigate = useNavigate();

  const handleGenerateKeys = async () => {
    await generateUserKeys();
  };

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">Welcome, {authState.user?.name}</h1>
            <p className="text-muted-foreground">
              Manage and track your secure documents
            </p>
          </div>
          <Button 
            className="mt-4 md:mt-0"
            onClick={() => navigate('/upload')}
          >
            <Upload className="mr-2 h-4 w-4" /> Upload Document
          </Button>
        </div>

        {/* Crypto Key Management Section */}
        <Card className="mb-8">
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
                  {userHasKeys
                    ? 'Cryptographic keys are available for secure document signing'
                    : 'No cryptographic keys found - generate keys to enable secure signing'
                  }
                </p>
              </div>
              <div className="flex items-center gap-4">
                {userHasKeys ? (
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
                {!userHasKeys && (
                  <Button onClick={handleGenerateKeys} disabled={isLoading}>
                    <Key className="h-4 w-4 mr-2" />
                    {isLoading ? 'Generating...' : 'Generate Keys'}
                  </Button>
                )}
              </div>
            </div>

            {!userHasKeys && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Cryptographic Keys Required</AlertTitle>
                <AlertDescription>
                  Generate RSA cryptographic keys to enable secure document signing with digital signatures.
                  This creates a unique key pair that ensures non-repudiation and document integrity.
                </AlertDescription>
              </Alert>
            )}

            {userHasKeys && (
              <Alert className="mt-4 bg-green-50 border-green-200">
                <Shield className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-700">Secure Signing Enabled</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your documents will be signed using RSA-2048 cryptographic signatures with SHA-256 hashing
                  for maximum security and legal compliance.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Documents</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-24 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-6">
                Upload your first document to get started
              </p>
              <Button onClick={() => navigate('/upload')}>
                <Upload className="mr-2 h-4 w-4" /> Upload Document
              </Button>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2 border-dashed"
              onClick={() => navigate('/upload')}
            >
              <Upload className="h-6 w-6" />
              <span>Upload Document</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2 border-dashed"
              onClick={() => navigate('/sign')}
            >
              <FileText className="h-6 w-6" />
              <span>Sign Document</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2 border-dashed"
              onClick={() => navigate('/verify')}
            >
              <FileText className="h-6 w-6" />
              <span>Verify Document</span>
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
