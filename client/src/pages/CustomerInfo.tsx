import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'wouter';
import { useApp } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { customerService } from '@/lib/supabaseService';
import { toast } from 'sonner';

const formSchema = z.object({
  vehicleNumber: z.string().min(2, "Vehicle number is required"),
  fullName: z.string().min(2, "Full name is required"),
  contactNumber: z.string().regex(/^[0-9]{9,10}$/, "Invalid phone number"),
  serviceType: z.enum(['one_day', 'normal'], { required_error: "Please select a service type" }),
});

export default function CustomerInfo() {
  const { t, updateCustomerDetails, customerDetails } = useApp();
  const [_, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vehicleNumber: customerDetails.vehicleNumber || '',
      fullName: customerDetails.fullName || '',
      contactNumber: customerDetails.contactNumber || '',
      serviceType: (customerDetails.serviceType as 'one_day' | 'normal') || 'one_day',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // First, check if customer exists by phone
      const existingCustomer = await customerService.getByPhone(values.contactNumber);
      
      let customerId: string;
      if (existingCustomer) {
        // Update existing customer
        const updated = await customerService.update(existingCustomer.id, {
          name: values.fullName,
          phone: values.contactNumber,
          license_number: values.vehicleNumber,
        });
        customerId = updated.id;
        toast.success('Customer updated successfully');
      } else {
        // Create new customer
        const created = await customerService.create({
          name: values.fullName,
          phone: values.contactNumber,
          license_number: values.vehicleNumber,
        });
        customerId = created.id;
        toast.success('Customer saved successfully');
      }

      // Update context with customer details
      updateCustomerDetails(values);
      
      // Store customer ID in localStorage for later use
      localStorage.setItem('dmt_customer_id', customerId);
      
      // Navigate to next step
      setLocation('/service-selection');
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error('Failed to save customer data');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center mb-6 sm:mb-8 px-2">
        <h2 className="text-xl sm:text-2xl font-bold text-primary">{t.customerInfo.title}</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2">{t.customerInfo.subtitle}</p>
      </div>

      <Card className="border-t-4 border-t-primary shadow-lg">
        <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              
              <FormField
                control={form.control}
                name="vehicleNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">{t.customerInfo.vehicleNumber}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.customerInfo.vehicleNumberPlaceholder} {...field} className="bg-background text-sm" data-testid="input-vehicle" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">{t.customerInfo.fullName}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.customerInfo.fullNamePlaceholder} {...field} className="bg-background text-sm" data-testid="input-name" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs sm:text-sm">{t.customerInfo.contactNumber}</FormLabel>
                    <FormControl>
                      <Input placeholder={t.customerInfo.contactNumberPlaceholder} {...field} type="tel" className="bg-background text-sm" data-testid="input-phone" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem className="space-y-2 sm:space-y-3">
                    <FormLabel className="text-xs sm:text-sm">{t.customerInfo.serviceType}</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="one_day" data-testid="radio-oneday" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer text-xs sm:text-sm">
                            {t.customerInfo.oneDay}
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="normal" data-testid="radio-normal" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer text-xs sm:text-sm">
                            {t.customerInfo.normal}
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full text-sm sm:text-base py-4 sm:py-6" data-testid="button-submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : t.customerInfo.continue}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
