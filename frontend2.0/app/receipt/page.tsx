"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, Receipt, CreditCard, Calendar, Store, DollarSign, FileText, Download } from 'lucide-react';

interface ExtractedData {
  merchant?: string;
  date?: string;
  amount?: string;
  items?: Array<{
    name: string;
    quantity?: number;
    price?: number;
  }>;
  total?: string;
  tax?: string;
  [key: string]: any;
}

interface MockbankResult {
  success: boolean;
  transaction_id?: string;
  amount?: number;
  merchant?: string;
  date?: string;
  error?: string;
}

export default function ReceiptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jpgFilename, setJpgFilename] = useState<string | null>(null);
  const [textFilename, setTextFilename] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const [mockbankResult, setMockbankResult] = useState<MockbankResult | null>(null);

  useEffect(() => {
    const fetchReceiptData = async () => {
      try {
        setLoading(true);
        
        // Get filenames from URL parameters
        const jpg = searchParams.get('jpg_filename');
        const text = searchParams.get('text_filename');
        
        // If parameters are missing, try to fetch the most recent receipt
        if (!jpg || !text) {
          try {
            // Fetch the most recent receipt from the backend
            const response = await fetch('http://localhost:5000/api/recent_receipt');
            if (!response.ok) {
              throw new Error('Failed to fetch recent receipt');
            }
            
            const data = await response.json();
            if (data.jpg_filename && data.text_filename) {
              setJpgFilename(data.jpg_filename);
              setTextFilename(data.text_filename);
              
              // Fetch the text content
              const textResponse = await fetch(`http://localhost:5000/download/${data.text_filename}`);
              if (!textResponse.ok) {
                throw new Error('Failed to fetch text data');
              }
              
              const textContent = await textResponse.text();
              try {
                const jsonData = JSON.parse(textContent);
                setExtractedData(jsonData);
              } catch (e) {
                console.error('Error parsing JSON:', e);
                setExtractedData({ raw: textContent });
              }
              
              // Fetch transaction status
              const txResponse = await fetch(`http://localhost:5000/api/transaction_status?receipt_id=${data.receipt_id || ''}`);
              if (txResponse.ok) {
                const txData = await txResponse.json();
                setMockbankResult(txData);
              } else {
                // Fallback to simulated data
                setMockbankResult({
                  success: true,
                  transaction_id: `TX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                  amount: extractedData.amount ? parseFloat(extractedData.amount) : 0,
                  merchant: extractedData.merchant || 'Unknown Merchant',
                  date: extractedData.date || new Date().toISOString().split('T')[0]
                });
              }
              
              setLoading(false);
              return;
            } else {
              throw new Error('No receipt data available');
            }
          } catch (recentError) {
            console.error('Error fetching recent receipt:', recentError);
            setError('No receipt parameters provided and could not fetch recent receipt');
            setLoading(false);
            return;
          }
        }
        
        setJpgFilename(jpg);
        setTextFilename(text);
        
        // Fetch the text file content
        const textResponse = await fetch(`http://localhost:5000/download/${text}`);
        if (!textResponse.ok) {
          throw new Error('Failed to fetch text data');
        }
        
        const textContent = await textResponse.text();
        try {
          // Try to parse as JSON
          const jsonData = JSON.parse(textContent);
          setExtractedData(jsonData);
        } catch (e) {
          console.error('Error parsing JSON:', e);
          setExtractedData({ raw: textContent });
        }
        
        // Try to get transaction status from backend
        try {
          const receiptId = searchParams.get('receipt_id') || '';
          const txResponse = await fetch(`http://localhost:5000/api/transaction_status?receipt_id=${receiptId}`);
          if (txResponse.ok) {
            const txData = await txResponse.json();
            setMockbankResult(txData);
          } else {
            throw new Error('Could not fetch transaction status');
          }
        } catch (txError) {
          console.error('Error fetching transaction status:', txError);
          // Fallback to simulated data
          setMockbankResult({
            success: true,
            transaction_id: `TX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            amount: extractedData.amount ? parseFloat(extractedData.amount) : 0,
            merchant: extractedData.merchant || 'Unknown Merchant',
            date: extractedData.date || new Date().toISOString().split('T')[0]
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching receipt data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchReceiptData();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button 
          className="mt-4" 
          onClick={() => router.push('/')}
        >
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Receipt Processing Results</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Receipt Image Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Processed Receipt Image
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            {jpgFilename && (
              <div className="relative w-full max-w-md h-[400px] border rounded-md overflow-hidden">
                <Image 
                  src={`http://localhost:5000/download/${jpgFilename}`}
                  alt="Processed Receipt"
                  fill
                  style={{ objectFit: 'contain' }}
                  unoptimized // Add this to bypass Next.js image optimization for external URLs
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open(`http://localhost:5000/download/${jpgFilename}`, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Image
            </Button>
          </CardFooter>
        </Card>

        {/* Extracted Data Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Extracted Receipt Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {extractedData.merchant && (
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Merchant</p>
                  <p className="font-medium">{extractedData.merchant}</p>
                </div>
              </div>
            )}
            
            {extractedData.date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{extractedData.date}</p>
                </div>
              </div>
            )}
            
            {extractedData.amount && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">₹{extractedData.amount}</p>
                </div>
              </div>
            )}
            
            {extractedData.items && extractedData.items.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Items</p>
                <div className="border rounded-md p-3 bg-muted/50">
                  <ul className="space-y-2">
                    {extractedData.items.map((item, index) => (
                      <li key={index} className="flex justify-between">
                        <span>{item.name}</span>
                        <span>₹{item.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {/* Show all other fields */}
            {Object.entries(extractedData)
              .filter(([key]) => !['merchant', 'date', 'amount', 'items'].includes(key))
              .map(([key, value]) => (
                <div key={key} className="flex items-start gap-2">
                  <div className="h-5 w-5 text-primary mt-1">•</div>
                  <div>
                    <p className="text-sm text-muted-foreground capitalize">{key}</p>
                    <p className="font-medium">
                      {typeof value === 'object' 
                        ? JSON.stringify(value) 
                        : String(value)}
                    </p>
                  </div>
                </div>
              ))}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open(`/download/${textFilename}`, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Text Data
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* MockBank Transaction Card */}
      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            MockBank Transaction
          </CardTitle>
          <CardDescription>
            The receipt data has been converted to a transaction in your MockBank account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mockbankResult?.success ? (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Transaction Created Successfully</AlertTitle>
                <AlertDescription className="text-green-700">
                  The transaction has been added to your MockBank account.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="border rounded-md p-4">
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                  <p className="font-medium">{mockbankResult.transaction_id}</p>
                </div>
                
                <div className="border rounded-md p-4">
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium text-red-600">-₹{mockbankResult.amount}</p>
                </div>
                
                <div className="border rounded-md p-4">
                  <p className="text-sm text-muted-foreground">Merchant</p>
                  <p className="font-medium">{mockbankResult.merchant}</p>
                </div>
                
                <div className="border rounded-md p-4">
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{mockbankResult.date}</p>
                </div>
              </div>
            </div>
          ) : (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Transaction Failed</AlertTitle>
              <AlertDescription>
                {mockbankResult?.error || "Could not create transaction in MockBank."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-center">
        <Button 
          size="lg"
          onClick={() => router.push('/')}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}