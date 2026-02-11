import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { PUBLIC_SOLANA_RPC_ENDPOINTS } from "@shared/config";
import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import { WalletSelector } from "@/components/WalletSelector";

import { StatusAlert } from "@/components/StatusAlert";

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  userId: number | null;
  role: "user" | "advertiser" | "admin" | null;
  connect: (role: "user" | "advertiser") => Promise<void>;
  disconnect: () => void;
  isLoading: boolean;
  solBalance: number | null;
  walletBalance: number | null;
  showSelector: boolean;
  setShowSelector: (show: boolean) => void;
  pendingRole: "user" | "advertiser" | null;
  accountStatus: "active" | "suspended" | "blocked";
}

declare global {
  interface Window {
    solana: any;
    Buffer: typeof Buffer;
  }
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState<"user" | "advertiser" | "admin" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [pendingRole, setPendingRole] = useState<"user" | "advertiser" | null>(null);
  const [accountStatus, setAccountStatus] = useState<"active" | "suspended" | "blocked">("active");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchBalance = async (address: string) => {
    try {
      const endpoints = PUBLIC_SOLANA_RPC_ENDPOINTS;
      
      for (const endpoint of endpoints) {
        try {
          const connection = new Connection(endpoint, "confirmed");
          const publicKey = new PublicKey(address);
          const balance = await connection.getBalance(publicKey);
          setSolBalance(balance / LAMPORTS_PER_SOL);
          return; // Success
        } catch (e) {
          // Suppress warnings for expected RPC flakiness in development
          // console.warn(`Balance fetch failed for ${endpoint}`);
        }
      }
      setSolBalance(0);
    } catch (error) {
      console.error("Balance fetch failed completely");
      setSolBalance(0);
    }
  };

  useEffect(() => {
    const savedAddress = localStorage.getItem("wallet_address");
    const savedRole = localStorage.getItem("user_role") as "user" | "advertiser" | "admin";
    const savedId = localStorage.getItem("user_id");
    const savedStatus = localStorage.getItem("user_status") as "active" | "suspended" | "blocked";
    
    if (savedAddress && savedRole) {
      setWalletAddress(savedAddress);
      setRole(savedRole);
      if (savedId) setUserId(parseInt(savedId));
      if (savedStatus) setAccountStatus(savedStatus);
      fetchBalance(savedAddress);
    }
  }, []);

  const handleWalletSelect = async (solanaInstance: any) => {
    setShowSelector(false);
    if (!pendingRole) return;
    
    setIsLoading(true);
    try {
      console.log("Selected wallet instance:", solanaInstance);
      
      // Extensive provider normalization
      let provider = solanaInstance;
      if (solanaInstance.solana) provider = solanaInstance.solana;
      
      // Ensure we have a connect method
      if (typeof provider.connect !== 'function' && typeof solanaInstance.connect === 'function') {
        provider = solanaInstance;
      }

      if (!provider || typeof provider.connect !== 'function') {
        console.error("Invalid provider structure:", provider);
        throw new Error("Invalid wallet provider. Please try again or refresh.");
      }

      console.log("Found provider, calling connect...");
      // Normalize connect call for various providers
      let response;
      try {
        if (typeof provider.connect === 'function') {
          response = await provider.connect({ onlyIfTrusted: false });
        } else if (typeof provider === 'function') {
          response = await provider({ onlyIfTrusted: false });
        } else {
          response = provider;
        }
      } catch (e: any) {
        console.error("Connect error:", e);
        if (e.message?.includes('User rejected')) throw e;
        response = provider;
      }
      
      console.log("Connect response:", response);
      
      // Handle the case where the public key is nested or returned directly
      let publicKey = response?.publicKey || provider.publicKey;
      
      // If we still don't have it, check if response is the public key itself
      if (!publicKey && response && (response.toBase58 || response.toString().length > 30)) {
        publicKey = response;
      }

      // Final fallback to global objects if the direct connection didn't provide it
      if (!publicKey) {
        publicKey = provider.publicKey || (window as any).solana?.publicKey || (window as any).solflare?.publicKey || (window as any).phantom?.solana?.publicKey;
      }
      
      if (!publicKey) {
        throw new Error("Could not retrieve wallet address. Please make sure your wallet is unlocked and try again.");
      }
      
      const publicAddress = publicKey.toString();

      if (typeof provider.signMessage !== 'function') {
        throw new Error("Selected wallet does not support message signing. Please use Phantom or Solflare.");
      }

      const challengeRes = await fetch('/api/users/auth/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: publicAddress })
      });

      if (!challengeRes.ok) {
        throw new Error("Failed to fetch wallet challenge from server");
      }

      const challenge = await challengeRes.json();
      const messageBytes = new TextEncoder().encode(challenge.message as string);
      const signed = await provider.signMessage(messageBytes, 'utf8');
      const signatureBytes: Uint8Array = (signed?.signature ? signed.signature : signed) as Uint8Array;
      const signature = btoa(String.fromCharCode(...Array.from(signatureBytes)));

      const res = await fetch('/api/users/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-referrer-wallet': new URLSearchParams(window.location.search).get('ref') || ''
        },
        body: JSON.stringify({
          walletAddress: publicAddress,
          role: pendingRole,
          nonce: challenge.nonce,
          signature
        })
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Auth API error:", res.status, errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }

        if (res.status === 403 && (errorData.status === 'blocked' || errorData.status === 'suspended')) {
          setAccountStatus(errorData.status);
          localStorage.setItem("user_status", errorData.status);
          throw new Error(errorData.message);
        }
        throw new Error(errorData.message || "Backend authentication failed");
      }
      
      const user = await res.json();
      
      if (!user.acceptedTerms && !window.location.pathname.includes('/terms')) {
        // We allow the login but user state will reflect they need to accept terms
        // The UI should handle redirecting or showing the terms modal
      }
      
      setWalletAddress(user.walletAddress);
      setRole(user.role);
      setUserId(user.id);
      setAccountStatus(user.status || "active");
      fetchBalance(user.walletAddress);
      
      localStorage.setItem("wallet_address", user.walletAddress);
      localStorage.setItem("user_role", user.role);
      localStorage.setItem("user_id", user.id.toString());
      localStorage.setItem("user_status", user.status || "active");

      toast({
        title: "Wallet Connected",
        description: `Connected as ${pendingRole}`,
        className: "border-primary/50 text-foreground bg-background/95 backdrop-blur-md",
      });

      queryClient.invalidateQueries({ queryKey: [api.users.get.path, user.walletAddress] });

      if (solanaInstance && solanaInstance.on) {
        solanaInstance.on('disconnect', () => {
          disconnect();
        });
      }
    } catch (error: any) {
      console.error("Connection error detail:", error);
      // Only show generic toast if it's not a status error which we handle via UI
      if (!["blocked", "suspended"].includes(accountStatus)) {
        toast({
          title: "Connection Failed",
          description: error.message || "Could not connect to Solana wallet.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      setPendingRole(null);
    }
  };

  const { data: userStats, refetch: refetchStats } = useQuery<any>({
    queryKey: [api.users.stats.path, walletAddress],
    enabled: !!walletAddress,
    staleTime: 30000,
  });

  const connect = async (selectedRole: "user" | "advertiser") => {
    setPendingRole(selectedRole);
    setShowSelector(true);
  };

  const disconnect = () => {
    fetch('/api/users/logout', { method: 'POST' }).catch(() => undefined);
    setWalletAddress(null);
    setRole(null);
    setUserId(null);
    setSolBalance(null);
    setAccountStatus("active");
    localStorage.removeItem("wallet_address");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_status");
    queryClient.clear();
    
    toast({
      title: "Disconnected",
      description: "Wallet disconnected successfully.",
    });
  };

  return (
    <WalletContext.Provider value={{
      isConnected: !!walletAddress,
      walletAddress,
      userId,
      role,
      connect,
      disconnect,
      isLoading,
      solBalance,
      walletBalance,
      showSelector,
      setShowSelector,
      pendingRole,
      accountStatus
    }}>
      {children}
      {accountStatus !== "active" && (
        <StatusAlert status={accountStatus as "suspended" | "blocked"} />
      )}
      <WalletSelector 
        open={showSelector} 
        onOpenChange={setShowSelector} 
        onSelect={handleWalletSelect}
      />
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    // Return a dummy object if used outside provider to prevent crashing during SSR or HMR
    return {
      isConnected: false,
      walletAddress: null,
      userId: null,
      role: null,
      connect: async () => {},
      disconnect: () => {},
      isLoading: false,
      solBalance: null,
      walletBalance: null,
      showSelector: false,
      setShowSelector: () => {},
      pendingRole: null,
      accountStatus: "active" as const
    };
  }
  return context;
}
