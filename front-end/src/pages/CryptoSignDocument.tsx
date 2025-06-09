import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  ChevronLeft, 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  Key
} from 'lucide-react';
import { useCrypto } from '@/contexts/CryptoContext';
import { CryptoDocumentStatus } from '@/types/crypto';
import SignaturePad from '@/components/SignaturePad';
import { toast } from 'sonner';

const CryptoSignDocument: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDocumentById, signDocument, userKeys, isLoading } = useCrypto();
  const [document, setDocument] = useState<any>(null);
  const [signatureMethod, setSignatureMethod] = useState<'draw' | 'type'>('draw');
  const [typeSignature, setTypeSignature] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (id) {
      const doc = getDocumentById(id);
      if (doc) {
        setDocument(doc);
        
        // Check if document can be signed
        if (doc.status !== CryptoDocumentStatus.UPLOADED) {
          toast.error("This document has already been signed or cannot be signed");
          navigate('/crypto');
        }
      } else {
        toast.error("Document not found");
        navigate('/crypto');
      }
    } else {
      navigate('/crypto');
    }
  }, [id, getDocumentById, navigate]);

  useEffect(() => {
    // Check if user has keys
    if (!userKeys?.hasKeys) {
      toast.error("Please generate cryptographic keys first");
      navigate('/crypto');
    }
  }, [userKeys, navigate]);

  const handleSignatureCapture = async (signatureDataUrl: string) => {
    if (!id) return;
    
    setIsProcessing(true);
    try {
      const success = await signDocument(id, signatureDataUrl);
      
      if (success) {
        // Refresh document data
        const updatedDoc = getDocumentById(id);
        setDocument(updatedDoc);
        
        toast.success("Document signed successfully with cryptographic signature!");
        navigate(`/crypto/verify/${id}`);
      }
    } catch (error) {
      console.error('Error signing document:', error);
      toast.error('Failed to sign document. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTypeSignatureSubmit = () => {
    if (!typeSignature.trim()) return;
    
    // Convert text to image (simple canvas solution)
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '32px cursive';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typeSignature, canvas.width / 2, canvas.height / 2);
      
      const signatureDataUrl = canvas.toDataURL('image/png');
      handleSignatureCapture(signatureDataUrl);
    }
  };

  if (!document) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => navigate('/crypto')} className="mr-4">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Loading...</h1>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/crypto')} className="mr-4">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Sign Document with Crypto</h1>
        </div>
      
        <div className="max-w-3xl mx-auto">
          {/* Document Info */}
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileText className="h-10 w-10 text-primary" />
                  <div>
                    <CardTitle>{document.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{document.fileName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{document.status}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="my-6 p-4 bg-gray-50 rounded document-preview min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Document Preview</p>
                  <p className="text-xs text-muted-foreground mt-1">{document.fileName}</p>
                </div>
              </div>
              
              {document.hash && (
                <div className="mt-4 p-2 bg-gray-50 rounded text-xs font-mono overflow-auto">
                  <p className="font-medium">Document Hash:</p>
                  <p className="mt-1 break-all">{document.hash}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Crypto Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Cryptographic Signing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <Shield className="h-4 w-4" />
                <AlertTitle>Secure Cryptographic Signing</AlertTitle>
                <AlertDescription>
                  This document will be signed using RSA cryptographic signatures with SHA-256 hashing. 
                  The signature provides non-repudiation and ensures document integrity.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Algorithm:</span>
                  <span className="ml-2 font-medium">RSA with SHA-256</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Key Size:</span>
                  <span className="ml-2 font-medium">2048 bits</span>
                </div>
                <div>
                  <span className="text-muted-foreground">User ID:</span>
                  <span className="ml-2 font-medium">{userKeys?.userId}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Signature Type:</span>
                  <span className="ml-2 font-medium">Digital Signature</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Signature Input */}
          <Card>
            <CardHeader>
              <CardTitle>Add Your Signature</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="draw" onValueChange={(value) => setSignatureMethod(value as 'draw' | 'type')}>
                <TabsList className="mb-6">
                  <TabsTrigger value="draw">Draw Signature</TabsTrigger>
                  <TabsTrigger value="type">Type Signature</TabsTrigger>
                </TabsList>
                
                <TabsContent value="draw">
                  <div className="mb-6">
                    <p className="mb-4 text-muted-foreground">
                      Use your mouse or touch screen to draw your signature below. 
                      This will be combined with your cryptographic signature.
                    </p>
                    <div className="bg-white rounded-lg overflow-hidden border">
                      <SignaturePad onSave={handleSignatureCapture} />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="type">
                  <div className="mb-6">
                    <p className="mb-4 text-muted-foreground">
                      Type your name below to create a signature. 
                      This will be combined with your cryptographic signature.
                    </p>
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={typeSignature}
                        onChange={(e) => setTypeSignature(e.target.value)}
                        className="w-full p-4 text-2xl font-cursive border rounded-lg"
                        placeholder="Type your signature here"
                        style={{ fontFamily: 'cursive' }}
                      />
                      <Button 
                        onClick={handleTypeSignatureSubmit}
                        disabled={!typeSignature.trim() || isProcessing}
                        className="min-w-[120px]"
                      >
                        {isProcessing ? 'Processing...' : 'Apply Signature'}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              {isProcessing && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Processing Signature</AlertTitle>
                  <AlertDescription>
                    Your document is being signed with cryptographic signatures. Please wait...
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default CryptoSignDocument;
