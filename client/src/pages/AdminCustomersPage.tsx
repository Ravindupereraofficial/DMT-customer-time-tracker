import React, { useEffect, useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { customerService, serviceService, documentService, feedbackService } from '@/lib/supabaseService';
import { ArrowLeft, Search, X } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerDetail {
  customer: any;
  services: any[];
  documents: any[];
  feedback: any[];
}

export default function AdminCustomersPage() {
  const { isLoggedIn } = useAdmin();
  const [_, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      setLocation('/admin-login');
    }
  }, [isLoggedIn, setLocation]);

  useEffect(() => {
    if (isLoggedIn) {
      loadCustomers();
    }
  }, [isLoggedIn]);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const allCustomers = await customerService.getAll();
      setCustomers(allCustomers || []);
      setFilteredCustomers(allCustomers || []);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(term.toLowerCase()) ||
          customer.phone.includes(term) ||
          (customer.license_number && customer.license_number.includes(term))
      );
      setFilteredCustomers(filtered);
    }
  };

  const viewCustomerDetails = async (customerId: string) => {
    try {
      const customer = customers.find((c) => c.id === customerId);
      const services = await serviceService.getByCustomerId(customerId);
      const documents = await documentService.getByCustomerId(customerId);
      const feedback = await feedbackService.getByCustomerId(customerId);

      setSelectedCustomer({
        customer,
        services: services || [],
        documents: documents || [],
        feedback: feedback || [],
      });
    } catch (error) {
      console.error('Error loading customer details:', error);
      toast.error('Failed to load customer details');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base">Loading customers...</p>
        </div>
      </div>
    );
  }

  if (selectedCustomer) {
    return (
      <div className="min-h-screen bg-background py-4 sm:py-6 md:py-8">
        <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => setSelectedCustomer(null)}
              variant="ghost"
              size="sm"
              className="text-xs sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">Customer Details</h1>
          </div>

          {/* Customer Info Card */}
          <Card className="mb-6">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-lg sm:text-xl">{selectedCustomer.customer.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Phone</p>
                <p className="font-semibold text-sm sm:text-base">{selectedCustomer.customer.phone}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">License Number</p>
                <p className="font-semibold text-sm sm:text-base">{selectedCustomer.customer.license_number || '-'}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">City</p>
                <p className="font-semibold text-sm sm:text-base">{selectedCustomer.customer.city || '-'}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Address</p>
                <p className="font-semibold text-sm sm:text-base truncate">{selectedCustomer.customer.address || '-'}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Registered</p>
                <p className="font-semibold text-sm sm:text-base">
                  {new Date(selectedCustomer.customer.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Services ({selectedCustomer.services.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCustomer.services.length === 0 ? (
                <p className="text-xs sm:text-sm text-muted-foreground">No services yet</p>
              ) : (
                <div className="space-y-3">
                  {selectedCustomer.services.map((service) => (
                    <div key={service.id} className="border rounded-lg p-3 hover:bg-muted/50">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm sm:text-base capitalize">{service.service_type}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">{service.description || 'No description'}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                          service.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {service.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(service.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Documents ({selectedCustomer.documents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCustomer.documents.length === 0 ? (
                <p className="text-xs sm:text-sm text-muted-foreground">No documents</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="text-xs sm:text-sm">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-2 sm:px-4">Type</TableHead>
                        <TableHead className="px-2 sm:px-4 hidden sm:table-cell">File Name</TableHead>
                        <TableHead className="px-2 sm:px-4 hidden md:table-cell">Uploaded</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCustomer.documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="px-2 sm:px-4">{doc.document_type}</TableCell>
                          <TableCell className="px-2 sm:px-4 hidden sm:table-cell truncate">{doc.file_name || '-'}</TableCell>
                          <TableCell className="px-2 sm:px-4 hidden md:table-cell text-muted-foreground text-xs">
                            {new Date(doc.uploaded_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Feedback ({selectedCustomer.feedback.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCustomer.feedback.length === 0 ? (
                <p className="text-xs sm:text-sm text-muted-foreground">No feedback</p>
              ) : (
                <div className="space-y-4">
                  {selectedCustomer.feedback.map((fb) => (
                    <div key={fb.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">⭐</span>
                        <p className="font-semibold text-sm sm:text-base">{fb.rating}/5</p>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(fb.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{fb.feedback_text || 'No comment'}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">All Customers</h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground ml-10">Manage and view all customer records</p>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-4 sm:pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or license..."
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

        {/* Customers Grid/Table */}
        {filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No customers found</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-3 mb-8">
              {filteredCustomers.map((customer) => (
                <Card key={customer.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="pt-4 pb-4">
                    <p className="font-bold text-sm mb-1">{customer.name}</p>
                    <p className="text-xs text-muted-foreground mb-3">{customer.phone}</p>
                    <Button
                      onClick={() => viewCustomerDetails(customer.id)}
                      size="sm"
                      className="w-full text-xs"
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <Card className="hidden sm:block overflow-hidden">
              <div className="overflow-x-auto">
                <Table className="text-xs sm:text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-3 sm:px-4 py-2">Name</TableHead>
                      <TableHead className="px-3 sm:px-4 py-2">Phone</TableHead>
                      <TableHead className="px-3 sm:px-4 py-2 hidden md:table-cell">License</TableHead>
                      <TableHead className="px-3 sm:px-4 py-2 hidden lg:table-cell">Email</TableHead>
                      <TableHead className="px-3 sm:px-4 py-2 hidden lg:table-cell">Registered</TableHead>
                      <TableHead className="px-3 sm:px-4 py-2">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-muted/50">
                        <TableCell className="px-3 sm:px-4 py-2 font-medium truncate max-w-xs">{customer.name}</TableCell>
                        <TableCell className="px-3 sm:px-4 py-2">{customer.phone}</TableCell>
                        <TableCell className="px-3 sm:px-4 py-2 hidden md:table-cell truncate text-muted-foreground">
                          {customer.license_number || '-'}
                        </TableCell>
                        <TableCell className="px-3 sm:px-4 py-2 hidden lg:table-cell truncate text-muted-foreground">
                          {customer.email || '-'}
                        </TableCell>
                        <TableCell className="px-3 sm:px-4 py-2 hidden lg:table-cell text-muted-foreground text-xs">
                          {new Date(customer.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </TableCell>
                        <TableCell className="px-3 sm:px-4 py-2">
                          <Button
                            onClick={() => viewCustomerDetails(customer.id)}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </>
        )}

        {/* Results */}
        <p className="text-xs sm:text-sm text-muted-foreground mt-4 text-center">
          Showing {filteredCustomers.length} of {customers.length} customers
        </p>
      </div>
    </div>
  );
}
