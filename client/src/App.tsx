import { HelmetProvider, Helmet } from 'react-helmet-async';
import { Switch, Route, Redirect, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider, useWallet } from "@/hooks/use-wallet";
import { motion, AnimatePresence } from "framer-motion";
import { Footer } from "@/components/Footer";
import { ErrorBoundary } from "react-error-boundary";

// Direct Imports instead of Lazy Loading for instant transitions
import Landing from "@/pages/Landing";
import Earn from "@/pages/Earn";
import Dashboard from "@/pages/Dashboard";
import About from "@/pages/About";
import Leaderboard from "@/pages/Leaderboard";
import CampaignDetails from "@/pages/CampaignDetails";
import Explorer from "@/pages/Explorer";
import Admin from "@/pages/Admin";
import AdminPayouts from "@/pages/AdminPayouts";
import NotFound from "@/pages/not-found";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-primary gap-4">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
      />
      <p className="font-display font-bold animate-pulse uppercase tracking-widest">Loading...</p>
    </div>
  );
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-background">
      <h2 className="text-2xl font-bold mb-4 text-foreground">Something went wrong</h2>
      <pre className="text-sm bg-muted p-4 rounded mb-4 max-w-full overflow-auto text-destructive">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  );
}

function ProtectedRoute({ component: Component, allowedRole }: { component: any, allowedRole?: string }) {
  const { isConnected, role, isLoading } = useWallet();

  if (isLoading) return null; // Invisible loading to keep it professional for fast checks
  
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

import { TermsModal } from "@/components/TermsModal";

function Router() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/">
          <PageWrapper><Landing /></PageWrapper>
        </Route>
        <Route path="/about">
          <PageWrapper><About /></PageWrapper>
        </Route>
        <Route path="/leaderboard">
          <PageWrapper><Leaderboard /></PageWrapper>
        </Route>
        <Route path="/earn">
          <PageWrapper><Earn /></PageWrapper>
        </Route>
        <Route path="/explorer">
          <PageWrapper><Explorer /></PageWrapper>
        </Route>
        <Route path="/terms">
          <PageWrapper><Terms /></PageWrapper>
        </Route>
        <Route path="/privacy">
          <PageWrapper><Privacy /></PageWrapper>
        </Route>
        
        {/* User Routes */}
        <Route path="/dashboard">
          <ProtectedRoute component={Dashboard} />
        </Route>

        <Route path="/campaign/:id">
          <PageWrapper><CampaignDetails /></PageWrapper>
        </Route>
        <Route path="/api/campaigns/:id">
          <PageWrapper><CampaignDetails /></PageWrapper>
        </Route>
        <Route path="/c/:symbol">
          <PageWrapper><CampaignDetails /></PageWrapper>
        </Route>
        <Route path="/admin">
          <ProtectedRoute component={Admin} allowedRole="admin" />
        </Route>
        <Route path="/admin/prizes">
          <ProtectedRoute component={AdminPayouts} allowedRole="admin" />
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
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <WalletProvider>
            <TooltipProvider>
              <Helmet>
                <title>Dropy - Solana's Premier Campaign Platform</title>
                <meta name="description" content="Dropy is the ultimate pay-per-action marketing hub for the Solana ecosystem. Connect, engage, and earn verified rewards from the hottest crypto projects." />
                <meta property="og:title" content="Dropy - Solana's Premier Campaign Platform" />
                <meta property="og:description" content="The most professional marketing tool for Solana projects. Launch campaigns, verify social engagement, and reward your community instantly." />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
              </Helmet>
              <Toaster />
              <TermsModal />
              <div className="flex flex-col min-h-screen">
                <div className="flex-grow">
                  <Router />
                </div>
                <Footer />
              </div>
            </TooltipProvider>
          </WalletProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
