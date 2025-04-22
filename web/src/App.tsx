import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import AppointmentsPage from "@/pages/appointments-page";
import PatientsPage from "@/pages/patients-page";
import QueuePage from "@/pages/queue-page";
import RegistrationPage from "@/pages/registration-page";
import { AuthProvider } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

// Helper function to protect routes
function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }
  
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  return <Component />;
}

function Router() {
  return (
    <AuthProvider>
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/">
          {() => <PrivateRoute component={DashboardPage} />}
        </Route>
        <Route path="/appointments">
          {() => <PrivateRoute component={AppointmentsPage} />}
        </Route>
        <Route path="/patients">
          {() => <PrivateRoute component={PatientsPage} />}
        </Route>
        <Route path="/queue">
          {() => <PrivateRoute component={QueuePage} />}
        </Route>
        <Route path="/registration">
          {() => <PrivateRoute component={RegistrationPage} />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </AuthProvider>
  );
}

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
