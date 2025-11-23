import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useApp } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Smile, Meh, Frown } from 'lucide-react';
import { feedbackService } from '@/lib/supabaseService';
import { toast } from 'sonner';

export default function Feedback() {
  const { t } = useApp();
  const [_, setLocation] = useLocation();
  const [rating, setRating] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getRatingValue = (ratingStr: string | null): number => {
    if (ratingStr === 'bad') return 1;
    if (ratingStr === 'neutral') return 3;
    if (ratingStr === 'good') return 5;
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const customerId = localStorage.getItem('dmt_customer_id');
      
      // Save feedback to Supabase
      await feedbackService.create({
        customer_id: customerId || undefined,
        rating: getRatingValue(rating),
        feedback_text: feedbackText,
      });

      toast.success('Feedback submitted successfully');
      setSubmitted(true);
      
      // Reset after 3 seconds and go home
      setTimeout(() => {
        window.location.href = '/'; // Full reload to reset app state for demo
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in zoom-in duration-500 px-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full flex items-center justify-center mb-4 sm:mb-6 text-green-600">
          <Smile size={40} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2">{t.feedback.thankYou}</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">Your feedback helps us improve our service.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-xl mx-auto px-2 sm:px-0">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-primary">{t.feedback.title}</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">{t.feedback.subtitle}</p>
      </div>

      <Card>
        <CardContent className="pt-6 sm:pt-8 pb-6 sm:pb-8 px-3 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            
            <div className="flex justify-center gap-3 sm:gap-4 md:gap-8">
              <button
                type="button"
                onClick={() => setRating('bad')}
                className={`flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl transition-all ${rating === 'bad' ? 'bg-red-100 text-red-600 scale-110 ring-2 ring-red-200' : 'hover:bg-muted text-muted-foreground'}`}
              >
                <Frown size={32} className="sm:w-12 sm:h-12" strokeWidth={1.5} />
                <span className="text-xs sm:text-sm font-medium">Bad</span>
              </button>

              <button
                type="button"
                onClick={() => setRating('neutral')}
                className={`flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl transition-all ${rating === 'neutral' ? 'bg-yellow-100 text-yellow-600 scale-110 ring-2 ring-yellow-200' : 'hover:bg-muted text-muted-foreground'}`}
              >
                <Meh size={32} className="sm:w-12 sm:h-12" strokeWidth={1.5} />
                <span className="text-xs sm:text-sm font-medium">Okay</span>
              </button>

              <button
                type="button"
                onClick={() => setRating('good')}
                className={`flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4 rounded-xl transition-all ${rating === 'good' ? 'bg-green-100 text-green-600 scale-110 ring-2 ring-green-200' : 'hover:bg-muted text-muted-foreground'}`}
              >
                <Smile size={32} className="sm:w-12 sm:h-12" strokeWidth={1.5} />
                <span className="text-xs sm:text-sm font-medium">Good</span>
              </button>
            </div>

            <div className="space-y-2">
              <Textarea 
                placeholder={t.feedback.placeholder} 
                className="min-h-[100px] sm:min-h-[120px] resize-none text-xs sm:text-base p-3 sm:p-4"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full text-sm sm:text-base py-4 sm:py-6" 
              disabled={!rating || isLoading}
            >
              {isLoading ? 'Submitting...' : t.feedback.submit}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
