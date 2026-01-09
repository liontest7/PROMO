import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider, useWallet } from "@/hooks/use-wallet";

import Landing from "@/pages/Landing";
import Earn from "@/pages/Earn";
import Profile from "@/pages/Profile";
import Dashboard from "@/pages/Dashboard";
import AdvertiserDashboard from "@/pages/AdvertiserDashboard";
import About from "@/pages/About";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, allowedRole }: { component: any, allowedRole?: string }) {
  const { isConnected, role, isLoading } = useWallet();

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary">Loading...</div>;
  
  if (!isConnected) return <Redirect to="/" />;
  if (allowedRole && role !== allowedRole) return <Redirect to="/" />;

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/about" component={About} />
      <Route path="/earn" component={Earn} />
      <Route path="/profile" component={Profile} />
      
      {/* User Routes */}
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} allowedRole="user" />
      </Route>

      {/* Advertiser Routes */}
      <Route path="/advertiser">
        <ProtectedRoute component={AdvertiserDashboard} allowedRole="advertiser" />
      </Route>
      <Route path="/create-campaign">
        <ProtectedRoute component={AdvertiserDashboard} allowedRole="advertiser" />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
