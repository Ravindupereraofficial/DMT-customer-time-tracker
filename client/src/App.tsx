import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "./context/AppContext";
import { AdminProvider } from "./context/AdminContext";
import Layout from "./components/Layout";
import NotFound from "@/pages/not-found";

// Pages
import CustomerInfo from "./pages/CustomerInfo";
import ServiceSelection from "./pages/ServiceSelection";
import Documents from "./pages/Documents";
import StepConfirmation from "./pages/StepConfirmation";
import Feedback from "./pages/Feedback";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCustomersPage from "./pages/AdminCustomersPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CustomerInfo} />
      <Route path="/service-selection" component={ServiceSelection} />
      <Route path="/documents" component={Documents} />
      <Route path="/step-confirmation" component={StepConfirmation} />
      <Route path="/feedback" component={Feedback} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route path="/admin-customers" component={AdminCustomersPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminProvider>
        <AppProvider>
          <TooltipProvider>
            <Layout>
              <Router />
            </Layout>
            <Toaster />
          </TooltipProvider>
        </AppProvider>
      </AdminProvider>
    </QueryClientProvider>
  );
}

export default App;
