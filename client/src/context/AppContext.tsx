import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '../lib/translations';
import { stepTimingService } from '../lib/supabaseService';

interface CustomerDetails {
  vehicleNumber: string;
  fullName: string;
  contactNumber: string;
  serviceType: 'one_day' | 'normal' | '';
  transferType: string;
}

interface StepTiming {
  stepId: number;
  startTime: number;
  endTime: number | null;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  customerDetails: CustomerDetails;
  updateCustomerDetails: (details: Partial<CustomerDetails>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  stepTimings: StepTiming[];
  startStep: (stepId: number) => void;
  completeStep: (stepId: number) => void;
  t: any;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Language State
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('dmt_language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('dmt_language', lang);
  };

  // Theme State
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('dmt_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    localStorage.setItem('dmt_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Initialize Theme Effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Customer Details State
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    vehicleNumber: '',
    fullName: '',
    contactNumber: '',
    serviceType: '',
    transferType: ''
  });

  const updateCustomerDetails = (details: Partial<CustomerDetails>) => {
    setCustomerDetails(prev => ({ ...prev, ...details }));
  };

  // Step Tracking State
  const [currentStep, setCurrentStep] = useState(1);
  const [stepTimings, setStepTimings] = useState<StepTiming[]>([]);

  const startStep = (stepId: number) => {
    setStepTimings(prev => {
      const existing = prev.find(s => s.stepId === stepId);
      if (existing) return prev;
      return [...prev, { stepId, startTime: Date.now(), endTime: null }];
    });
  };

  const completeStep = async (stepId: number) => {
    const endTime = Date.now();
    const customerId = localStorage.getItem('dmt_customer_id');
    const serviceId = localStorage.getItem('dmt_service_id');
    
    // Update local state
    setStepTimings(prev => prev.map(s => 
      s.stepId === stepId ? { ...s, endTime } : s
    ));

    // Save to database
    if (customerId) {
      try {
        const currentTiming = stepTimings.find(s => s.stepId === stepId);
        if (currentTiming) {
          const durationSeconds = Math.floor((endTime - currentTiming.startTime) / 1000);
          const stepNames = ['Documents', 'Verification', 'Payment', 'Processing', 'Completed'];
          
          await stepTimingService.create({
            customer_id: customerId,
            service_id: serviceId || undefined,
            step_id: stepId,
            step_name: stepNames[stepId - 1] || `Step ${stepId}`,
            start_time: new Date(currentTiming.startTime).toISOString(),
            end_time: new Date(endTime).toISOString(),
            duration_seconds: durationSeconds,
          });
        }
      } catch (error) {
        console.error('Error saving step timing:', error);
      }
    }

    setCurrentStep(stepId + 1);
    startStep(stepId + 1); // Auto start next step
  };

  const t = translations[language];

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      customerDetails,
      updateCustomerDetails,
      currentStep,
      setCurrentStep,
      stepTimings,
      startStep,
      completeStep,
      t,
      theme,
      toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
