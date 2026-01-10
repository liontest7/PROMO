import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import { WalletSelector } from "@/components/WalletSelector";

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  userId: number | null;
  role: "user" | "advertiser" | null;
  connect: (role: "user" | "advertiser") => Promise<void>;
  disconnect: () => void;
  isLoading: boolean;
  solBalance: number | null;
  walletBalance: number | null;
  showSelector: boolean;
  setShowSelector: (show: boolean) => void;
  pendingRole: "user" | "advertiser" | null;
}

declare global {
  interface Window {
    solana: any;
  }
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState<"user" | "advertiser" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [pendingRole, setPendingRole] = useState<"user" | "advertiser" | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchBalance = async (address: string) => {
    try {
      const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      setSolBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Error fetching balance:", error);
      try {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const publicKey = new PublicKey(address);
        const balance = await connection.getBalance(publicKey);
        setSolBalance(balance / LAMPORTS_PER_SOL);
      } catch (e) {
        setSolBalance(0);
      }
    }
  };

  useEffect(() => {
    const savedAddress = localStorage.getItem("wallet_address");
    const savedRole = localStorage.getItem("user_role") as "user" | "advertiser";
    const savedId = localStorage.getItem("user_id");
    if (savedAddress && savedRole) {
      setWalletAddress(savedAddress);
      setRole(savedRole);
      if (savedId) setUserId(parseInt(savedId));
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
      
      const res = await fetch('/api/users/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicAddress,
          role: pendingRole
        })
      });
      
      if (!res.ok) throw new Error("Backend authentication failed");
      const user = await res.json();
      
      setWalletAddress(user.walletAddress);
      setRole(user.role);
      setUserId(user.id);
      fetchBalance(user.walletAddress);
      
      localStorage.setItem("wallet_address", user.walletAddress);
      localStorage.setItem("user_role", user.role);
      localStorage.setItem("user_id", user.id.toString());

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
      toast({
        title: "Connection Failed",
        description: error.message || "Could not connect to Solana wallet.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setPendingRole(null);
    }
  };

  const connect = async (selectedRole: "user" | "advertiser") => {
    setPendingRole(selectedRole);
    setShowSelector(true);
  };

  const disconnect = () => {
    setWalletAddress(null);
    setRole(null);
    setUserId(null);
    setSolBalance(null);
    localStorage.removeItem("wallet_address");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_id");
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
      pendingRole
    }}>
      {children}
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
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
