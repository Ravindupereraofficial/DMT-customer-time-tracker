import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useApp } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, MapPin, FileText, CreditCard, Settings, Flag } from 'lucide-react';

export default function StepConfirmation() {
  const { t, currentStep, completeStep, stepTimings } = useApp();
  const [_, setLocation] = useLocation();
  const [elapsed, setElapsed] = useState(0);

  // Timer for current step
  useEffect(() => {
    const timer = setInterval(() => {
      const currentTiming = stepTimings.find(s => s.stepId === currentStep);
      if (currentTiming && !currentTiming.endTime) {
        setElapsed(Math.floor((Date.now() - currentTiming.startTime) / 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [currentStep, stepTimings]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleCompleteStep = () => {
    completeStep(currentStep);
    setElapsed(0);
    if (currentStep === 5) {
      setLocation('/feedback');
    }
  };

  const steps = [
    { id: 1, label: "Documents", icon: FileText },
    { id: 2, label: "Verification", icon: CheckCircle2 },
    { id: 3, label: "Payment", icon: CreditCard },
    { id: 4, label: "Processing", icon: Settings },
    { id: 5, label: "Completed", icon: Flag },
  ];

  const getStepContent = (stepId: number) => {
    switch (stepId) {
      case 1: return t.steps.step1;
      case 2: return t.steps.step2;
      case 3: return t.steps.step3;
      case 4: return t.steps.step4;
      case 5: return t.steps.step5;
      default: return t.steps.step1;
    }
  };

  const currentContent = getStepContent(currentStep);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary">{t.steps.title}</h2>
      </div>

      {/* Progress Stepper */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -z-10 transform -translate-y-1/2 rounded-full"></div>
        <div 
          className="absolute top-1/2 left-0 h-1 bg-primary -z-10 transform -translate-y-1/2 rounded-full transition-all duration-500"
          style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
        ></div>
        <div className="flex justify-between">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2">
                <div className={`
                  w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all
                  ${isActive ? 'border-primary bg-primary text-white scale-110 shadow-lg' : ''}
                  ${isCompleted ? 'border-primary bg-primary/20 text-primary' : ''}
                  ${!isActive && !isCompleted ? 'border-muted bg-muted text-muted-foreground' : ''}
                `}>
                  <Icon size={16} />
                </div>
                <span className={`text-[10px] md:text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'} hidden md:block`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Card */}
      <Card className="border-2 border-primary/10 shadow-xl overflow-hidden">
        <div className="bg-primary/5 p-4 flex justify-between items-center border-b border-primary/10">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">{t.steps.currentStep}</p>
            <h3 className="text-xl font-bold text-primary mt-1">{currentContent.name}</h3>
          </div>
          <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-full shadow-sm border">
            <Clock className="h-4 w-4 text-primary animate-pulse" />
            <span className="font-mono font-medium">{formatTime(elapsed)}</span>
          </div>
        </div>

        <CardContent className="pt-6 pb-8">
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
              <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {t.steps.whatToDo}
              </h4>
              <ul className="space-y-3">
                {currentContent.items.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-sm md:text-base">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border flex items-center justify-center text-xs font-bold text-primary shadow-sm">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button 
              size="lg" 
              className="w-full text-lg py-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              onClick={handleCompleteStep}
            >
              {currentStep === 5 ? "Finish Process" : t.steps.completeThisStep}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
