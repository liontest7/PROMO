import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider, useWallet } from "@/hooks/use-wallet";
import { OnboardingSocials } from "@/components/onboarding/OnboardingSocials";
import { ScrollToTop } from "@/components/ScrollToTop";
import { motion, AnimatePresence } from "framer-motion";
import { Footer } from "@/components/Footer";

import Landing from "@/pages/Landing";
import Earn from "@/pages/Earn";
import Dashboard from "@/pages/Dashboard";
import AdvertiserDashboard from "@/pages/AdvertiserDashboard";

import About from "@/pages/About";
import CampaignDetails from "@/pages/CampaignDetails";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, allowedRole }: { component: any, allowedRole?: string }) {
  const { isConnected, role, isLoading } = useWallet();

  if (isLoading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-primary gap-4">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
      />
      <p className="font-display font-bold animate-pulse">VERIFYING WALLET...</p>
    </div>
  );
  
  if (!isConnected) return <Redirect to="/" />;
  if (allowedRole && role !== allowedRole) return <Redirect to="/" />;

  return <Component />;
}

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/">
          <PageWrapper><Landing /></PageWrapper>
        </Route>
        <Route path="/about">
          <PageWrapper><About /></PageWrapper>
        </Route>
        <Route path="/earn">
          <PageWrapper><Earn /></PageWrapper>
        </Route>
        
        {/* User Routes */}
        <Route path="/dashboard">
          <ProtectedRoute component={Dashboard} allowedRole="user" />
        </Route>

        {/* Advertiser Routes */}
        <Route path="/advertiser">
          <ProtectedRoute component={AdvertiserDashboard} allowedRole="advertiser" />
        </Route>
        <Route path="/campaign/:id">
          <PageWrapper><CampaignDetails /></PageWrapper>
        </Route>
        <Route path="/admin">
          <ProtectedRoute component={Admin} allowedRole="admin" />
        </Route>

        <Route>
          <PageWrapper><NotFound /></PageWrapper>
        </Route>
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <TooltipProvider>
          <Toaster />
          <ScrollToTop />
          <OnboardingSocials />
          <div className="flex flex-col min-h-screen">
            <div className="flex-grow">
              <Router />
            </div>
            <Footer />
          </div>
        </TooltipProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
