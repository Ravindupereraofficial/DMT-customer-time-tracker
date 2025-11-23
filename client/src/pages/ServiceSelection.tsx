import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useApp } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Car, Bike, Truck } from 'lucide-react';
import { serviceService } from '@/lib/supabaseService';
import { toast } from 'sonner';

export default function ServiceSelection() {
  const { t, updateCustomerDetails, customerDetails } = useApp();
  const [_, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleServiceSelect = async (service: string) => {
    setIsLoading(true);
    try {
      const customerId = localStorage.getItem('dmt_customer_id');
      if (!customerId) {
        toast.error('Customer ID not found');
        return;
      }

      // Save service to Supabase
      await serviceService.create({
        customer_id: customerId,
        service_type: service,
        status: 'pending',
      });

      updateCustomerDetails({ transferType: service });
      toast.success(`Service selected: ${service}`);
      setLocation('/documents');
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save service');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Summary Header */}
      <Card className="bg-muted/50 border-none shadow-sm">
        <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="h-8 sm:h-10 w-8 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <User size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Customer</p>
              <p className="font-semibold text-sm sm:text-base truncate">{customerDetails.fullName || "Guest"}</p>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Vehicle</p>
            <p className="font-semibold font-mono text-sm sm:text-base">{customerDetails.vehicleNumber || "---"}</p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-primary">{t.serviceSelection.title}</h2>
      </div>

      <div className="grid gap-3 sm:gap-4 max-w-md mx-auto w-full">
        <Button 
          variant="outline" 
          className="h-14 sm:h-16 text-sm sm:text-base border-2 hover:border-primary hover:bg-primary/5 transition-all justify-start px-4 sm:px-6 gap-3 sm:gap-4"
          onClick={() => handleServiceSelect('motorbike')}
          data-testid="btn-motorbike"
          disabled={isLoading}
        >
          <Bike className="h-5 sm:h-6 w-5 sm:w-6 text-primary flex-shrink-0" />
          <span className="truncate">{t.serviceSelection.motorbike}</span>
        </Button>

        <Button 
          variant="outline" 
          className="h-14 sm:h-16 text-sm sm:text-base border-2 hover:border-primary hover:bg-primary/5 transition-all justify-start px-4 sm:px-6 gap-3 sm:gap-4"
          onClick={() => handleServiceSelect('car')}
          data-testid="btn-car"
          disabled={isLoading}
        >
          <Car className="h-5 sm:h-6 w-5 sm:w-6 text-primary flex-shrink-0" />
          <span className="truncate">{t.serviceSelection.car}</span>
        </Button>

        {/* Non-functional placeholder buttons as requested */}
        <Button 
          variant="outline" 
          disabled
          className="h-14 sm:h-16 text-sm sm:text-base border-dashed justify-start px-4 sm:px-6 gap-3 sm:gap-4 opacity-50 cursor-not-allowed"
        >
          <Car className="h-5 sm:h-6 w-5 sm:w-6 flex-shrink-0" />
          <span className="truncate">{t.serviceSelection.dualPurpose}</span>
        </Button>

        <Button 
          variant="outline" 
          disabled
          className="h-14 sm:h-16 text-sm sm:text-base border-dashed justify-start px-4 sm:px-6 gap-3 sm:gap-4 opacity-50 cursor-not-allowed"
        >
          <Truck className="h-5 sm:h-6 w-5 sm:w-6 flex-shrink-0" />
          <span className="truncate">{t.serviceSelection.lorry}</span>
        </Button>

        <Button 
          variant="outline" 
          disabled
          className="h-14 sm:h-16 text-sm sm:text-base border-dashed justify-start px-4 sm:px-6 gap-3 sm:gap-4 opacity-50 cursor-not-allowed"
        >
          <div className="h-5 sm:h-6 w-5 sm:w-6 border-2 border-current rounded-full flex-shrink-0" />
          <span className="truncate">{t.serviceSelection.threeWheeler}</span>
        </Button>
      </div>

      <div className="flex justify-between pt-4 sm:pt-6">
        <Button variant="ghost" onClick={() => setLocation('/')} className="text-xs sm:text-sm">
          {t.serviceSelection.back}
        </Button>
      </div>
    </div>
  );
}
