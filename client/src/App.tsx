import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useAuth } from "./hooks/use-auth";

// Pages
import AuthPage from "./pages/auth-page";
import Dashboard from "./pages/dashboard";
import AdminBuses from "./pages/admin-buses";
import AdminBookings from "./pages/admin-bookings";
import CitizenBookings from "./pages/citizen-bookings";
import ChatPage from "./pages/chat";

function ProtectedRoute({ component: Component, adminOnly = false }: { component: any, adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Dashboard} />
      <Route path="/login" component={AuthPage} />
      
      {/* Protected Routes */}
      <Route path="/my-bookings">
        {() => <ProtectedRoute component={CitizenBookings} />}
      </Route>

      <Route path="/chat">
        {() => <ProtectedRoute component={ChatPage} />}
      </Route>

      {/* Admin Only Routes */}
      <Route path="/admin/buses">
        {() => <ProtectedRoute component={AdminBuses} adminOnly />}
      </Route>

      <Route path="/admin/bookings">
        {() => <ProtectedRoute component={AdminBookings} adminOnly />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
