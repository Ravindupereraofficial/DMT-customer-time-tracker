import React, { useEffect, useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { customerService, serviceService, documentService, feedbackService } from '@/lib/supabaseService';
import { LogOut, Users, Briefcase, FileText, MessageSquare, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  totalCustomers: number;
  totalServices: number;
  totalDocuments: number;
  totalFeedback: number;
  avgRating: number;
}

interface FeedbackData {
  rating: number;
  count: number;
}

export default function AdminDashboard() {
  const { logout, isLoggedIn } = useAdmin();
  const [_, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalServices: 0,
    totalDocuments: 0,
    totalFeedback: 0,
    avgRating: 0,
  });
  const [customers, setCustomers] = useState<any[]>([]);
  const [feedbackData, setFeedbackData] = useState<FeedbackData[]>([]);
  const [serviceTypes, setServiceTypes] = useState<{ name: string; value: number }[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      setLocation('/admin-login');
    }
  }, [isLoggedIn, setLocation]);

  const COLORS = ['#3b82f6', '#ef4444', '#fbbf24', '#10b981', '#8b5cf6'];

  useEffect(() => {
    if (isLoggedIn) {
      loadDashboardData();
    }
  }, [isLoggedIn]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch all customers
      const allCustomers = await customerService.getAll();
      setCustomers(allCustomers || []);

      // Fetch all feedback
      const allFeedback = await feedbackService.getAll();

      // Calculate stats
      const avgRating =
        allFeedback && allFeedback.length > 0
          ? (allFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / allFeedback.length).toFixed(2)
          : 0;

      // Group feedback by rating
      const feedbackCounts: Record<number, number> = {};
      if (allFeedback) {
        allFeedback.forEach((f) => {
          if (f.rating) {
            feedbackCounts[f.rating] = (feedbackCounts[f.rating] || 0) + 1;
          }
        });
      }

      const feedbackChartData = Object.entries(feedbackCounts).map(([rating, count]) => ({
        rating: parseInt(rating),
        count,
      }));
      setFeedbackData(feedbackChartData);

      // Group services by type
      let allServices: any[] = [];
      for (const customer of allCustomers || []) {
        const services = await serviceService.getByCustomerId(customer.id);
        if (services) allServices = [...allServices, ...services];
      }

      const serviceCounts: Record<string, number> = {};
      allServices.forEach((s) => {
        serviceCounts[s.service_type] = (serviceCounts[s.service_type] || 0) + 1;
      });

      const serviceChartData = Object.entries(serviceCounts).map(([type, count]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: count,
      }));
      setServiceTypes(serviceChartData);

      // Fetch all documents
      let allDocuments: any[] = [];
      for (const customer of allCustomers || []) {
        const docs = await documentService.getByCustomerId(customer.id);
        if (docs) allDocuments = [...allDocuments, ...docs];
      }

      setStats({
        totalCustomers: allCustomers?.length || 0,
        totalServices: allServices.length,
        totalDocuments: allDocuments.length,
        totalFeedback: allFeedback?.length || 0,
        avgRating: parseFloat(avgRating as any) || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-4 sm:py-6 md:py-8">
      <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">View all customer data and analytics</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setLocation('/admin-customers')}
              variant="outline"
              className="flex-1 sm:flex-none gap-2 text-xs sm:text-sm py-2 h-auto"
            >
              👥 Customers
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex-1 sm:flex-none gap-2 text-xs sm:text-sm py-2 h-auto"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Exit</span>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
          <StatCard
            icon={<Users className="h-5 w-5 sm:h-6 sm:w-6" />}
            label="Customers"
            value={stats.totalCustomers}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            icon={<Briefcase className="h-5 w-5 sm:h-6 sm:w-6" />}
            label="Services"
            value={stats.totalServices}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6" />}
            label="Documents"
            value={stats.totalDocuments}
            color="bg-yellow-100 text-yellow-600"
          />
          <StatCard
            icon={<MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />}
            label="Feedback"
            value={stats.totalFeedback}
            color="bg-purple-100 text-purple-600"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />}
            label="Avg Rating"
            value={stats.avgRating.toFixed(1)}
            color="bg-pink-100 text-pink-600"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-6 mb-6 sm:mb-8">
          {serviceTypes.length > 0 && (
            <Card className="overflow-hidden">
              <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Services by Type</CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-6 pt-0">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={serviceTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {serviceTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {feedbackData.length > 0 && (
            <Card className="overflow-hidden">
              <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Feedback Distribution</CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-6 pt-0">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={feedbackData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Customers Table */}
        <Card>
          <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3">
            <CardTitle className="text-base sm:text-lg">All Customers ({customers.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-3 sm:pt-4">
            {customers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 text-xs sm:text-sm">No customers yet</p>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="block sm:hidden space-y-3">
                  {customers.map((customer) => (
                    <div key={customer.id} className="border rounded-lg p-3 bg-muted/30 hover:bg-muted/50 transition">
                      <p className="font-bold text-sm">{customer.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{customer.phone}</p>
                      <p className="text-xs text-muted-foreground mt-1">License: {customer.license_number || '-'}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Name</TableHead>
                        <TableHead className="text-xs sm:text-sm">Phone</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden md:table-cell">License Number</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium text-xs sm:text-sm">{customer.name}</TableCell>
                          <TableCell className="text-xs sm:text-sm">{customer.phone}</TableCell>
                          <TableCell className="text-xs sm:text-sm hidden md:table-cell text-muted-foreground">
                            {customer.license_number || '-'}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm hidden lg:table-cell text-muted-foreground">
                            {new Date(customer.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-3 sm:pt-6 pb-3 sm:pb-6 px-3 sm:px-6">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{label}</p>
            <p className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2">{value}</p>
          </div>
          <div className={`p-2 sm:p-3 rounded-lg ${color} flex-shrink-0`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
