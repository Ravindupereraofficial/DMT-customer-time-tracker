import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useApp } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { documentService } from '@/lib/supabaseService';
import { toast } from 'sonner';

export default function Documents() {
  const { t, startStep } = useApp();
  const [_, setLocation] = useLocation();
  
  // 7 documents required
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const allChecked = Object.keys(checked).length === 7 && Object.values(checked).every(Boolean);

  const handleCheck = (id: number) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNext = async () => {
    if (allChecked) {
      setIsLoading(true);
      try {
        const customerId = localStorage.getItem('dmt_customer_id');
        if (!customerId) {
          toast.error('Customer ID not found');
          return;
        }

        // Save documents to Supabase
        const docs = [
          { id: 1, label: t.documents.doc1 },
          { id: 2, label: t.documents.doc2 },
          { id: 3, label: t.documents.doc3 },
          { id: 4, label: t.documents.doc4 },
          { id: 5, label: t.documents.doc5 },
          { id: 6, label: t.documents.doc6 },
          { id: 7, label: t.documents.doc7 },
        ];

        for (const doc of docs) {
          if (checked[doc.id]) {
            await documentService.create({
              customer_id: customerId,
              document_type: doc.label,
            });
          }
        }

        toast.success('Documents saved successfully');
        startStep(1); // Start timing for step 1
        setLocation('/step-confirmation');
      } catch (error) {
        console.error('Error saving documents:', error);
        toast.error('Failed to save documents');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const docs = [
    { id: 1, label: t.documents.doc1 },
    { id: 2, label: t.documents.doc2 },
    { id: 3, label: t.documents.doc3 },
    { id: 4, label: t.documents.doc4 },
    { id: 5, label: t.documents.doc5 },
    { id: 6, label: t.documents.doc6 },
    { id: 7, label: t.documents.doc7 },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-primary">{t.documents.title}</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">{t.documents.subtitle}</p>
      </div>

      <Card className="border shadow-md">
        <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
          <div className="space-y-2 sm:space-y-3">
            {docs.map((doc) => (
              <div key={doc.id} className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                <Checkbox 
                  id={`doc-${doc.id}`} 
                  checked={checked[doc.id] || false}
                  onCheckedChange={() => handleCheck(doc.id)}
                  className="mt-1 flex-shrink-0"
                />
                <Label 
                  htmlFor={`doc-${doc.id}`}
                  className="text-xs sm:text-sm md:text-base font-medium leading-relaxed cursor-pointer flex-grow"
                >
                  {doc.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-2 pt-4">
        <Button variant="outline" onClick={() => setLocation('/service-selection')} className="gap-2 text-xs sm:text-sm" size="sm">
          <ArrowLeft className="h-3 sm:h-4 w-3 sm:w-4" />
          <span className="hidden sm:inline">{t.documents.back}</span>
          <span className="sm:hidden">Back</span>
        </Button>

        <Button 
          onClick={handleNext} 
          disabled={!allChecked || isLoading}
          className="gap-2 text-xs sm:text-sm"
          size="sm"
          data-testid="btn-next-docs"
        >
          {isLoading ? 'Saving...' : t.documents.next}
          <ArrowRight className="h-3 sm:h-4 w-3 sm:w-4" />
        </Button>
      </div>
    </div>
  );
}
