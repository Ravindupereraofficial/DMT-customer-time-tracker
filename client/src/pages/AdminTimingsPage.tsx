import React, { useEffect, useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { customerService, stepTimingService } from '@/lib/supabaseService';
import { ArrowLeft, Search, X, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerTiming {
  customerId: string;
  customerName: string;
  customerPhone: string;
  totalSeconds: number;
  stepCount: number;
  lastActivity: string;
}

export default function AdminTimingsPage() {
  const { isLoggedIn } = useAdmin();
  const [_, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [customerTimings, setCustomerTimings] = useState<CustomerTiming[]>([]);
  const [filteredTimings, setFilteredTimings] = useState<CustomerTiming[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      setLocation('/admin-login');
    }
  }, [isLoggedIn, setLocation]);

  useEffect(() => {
    if (isLoggedIn) {
      loadTimingsData();
    }
  }, [isLoggedIn]);

  const loadTimingsData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all customers
      const customers = await customerService.getAll();
      
      if (!customers) {
        setCustomerTimings([]);
        setFilteredTimings([]);
        return;
      }

      // Fetch timings for each customer
      const timingsData: CustomerTiming[] = [];
      
      for (const customer of customers) {
        const timings = await stepTimingService.getByCustomerId(customer.id);
        
        if (timings && timings.length > 0) {
          const totalSeconds = timings.reduce((sum, t) => sum + (t.duration_seconds || 0), 0);
          const lastActivity = timings.sort((a, b) => 
            new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
          )[0]?.created_at || '';

          timingsData.push({
            customerId: customer.id,
            customerName: customer.name,
            customerPhone: customer.phone,
            totalSeconds,
            stepCount: timings.length,
            lastActivity,
          });
        }
      }

      // Sort by total time descending
      timingsData.sort((a, b) => b.totalSeconds - a.totalSeconds);
      
      setCustomerTimings(timingsData);
      setFilteredTimings(timingsData);
    } catch (error) {
      console.error('Error loading timings data:', error);
      toast.error('Failed to load timings data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setFilteredTimings(customerTimings);
    } else {
      const filtered = customerTimings.filter(
        (timing) =>
          timing.customerName.toLowerCase().includes(term.toLowerCase()) ||
          timing.customerPhone.includes(term)
      );
      setFilteredTimings(filtered);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base">Loading timings data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-4 sm:py-6 md:py-8">
      <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button
                onClick={() => setLocation('/admin-dashboard')}
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8" />
                Customer Timings
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground ml-10">
              View time spent by all customers on service steps
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Customers Tracked</p>
              <p className="text-3xl font-bold text-primary mt-2">{customerTimings.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Average Time per Customer</p>
              <p className="text-3xl font-bold text-primary mt-2">
                {customerTimings.length > 0
                  ? formatTime(
                      Math.floor(
                        customerTimings.reduce((sum, t) => sum + t.totalSeconds, 0) /
                          customerTimings.length
                      )
                    )
                  : '0h 0m 0s'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Steps Completed</p>
              <p className="text-3xl font-bold text-primary mt-2">
                {customerTimings.reduce((sum, t) => sum + t.stepCount, 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-4 sm:pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer name or phone..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 text-xs sm:text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timings Table */}
        {filteredTimings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'No matching customers found' : 'No timing data available'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-3 mb-8">
              {filteredTimings.map((timing) => (
                <Card key={timing.customerId} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-sm mb-1">{timing.customerName}</p>
                        <p className="text-xs text-muted-foreground">{timing.customerPhone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{formatTime(timing.totalSeconds)}</p>
                        <p className="text-xs text-muted-foreground">{timing.stepCount} steps</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last activity: {new Date(timing.lastActivity).toLocaleDateString()}
                    </p>
                    <Button
                      onClick={() => setLocation('/admin-customers')}
                      size="sm"
                      variant="outline"
                      className="w-full mt-3 text-xs"
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <Card className="hidden lg:block overflow-hidden">
              <CardHeader>
                <CardTitle>All Customer Timings ({filteredTimings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Customer Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Steps Completed</TableHead>
                        <TableHead>Total Time</TableHead>
                        <TableHead>Last Activity</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTimings.map((timing, index) => (
                        <TableRow key={timing.customerId} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-medium">{timing.customerName}</TableCell>
                          <TableCell>{timing.customerPhone}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                              {timing.stepCount} steps
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-primary">{formatTime(timing.totalSeconds)}</span>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(timing.lastActivity).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              onClick={() => setLocation('/admin-customers')}
                              size="sm"
                              variant="outline"
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Results */}
        <p className="text-xs sm:text-sm text-muted-foreground mt-4 text-center">
          Showing {filteredTimings.length} of {customerTimings.length} customers
        </p>
      </div>
    </div>
  );
}
