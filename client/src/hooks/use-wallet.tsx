import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  role: "user" | "advertiser" | null;
  connect: (role: "user" | "advertiser") => Promise<void>;
  disconnect: () => void;
  isLoading: boolean;
}

declare global {
  interface Window {
    solana: any;
  }
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [role, setRole] = useState<"user" | "advertiser" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load from local storage on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem("wallet_address");
    const savedRole = localStorage.getItem("user_role") as "user" | "advertiser";
    if (savedAddress && savedRole) {
      setWalletAddress(savedAddress);
      setRole(savedRole);
    }
  }, []);

  const connect = async (selectedRole: "user" | "advertiser") => {
    setIsLoading(true);
    try {
      // Real Solana Wallet Connection
      if (!window.solana || !window.solana.isPhantom) {
        toast({
          title: "Phantom Not Found",
          description: "Please install the Phantom wallet extension to continue.",
          variant: "destructive",
        });
        return;
      }

      const response = await window.solana.connect();
      const publicAddress = response.publicKey.toString();
      
      // Auth with backend
      const res = await apiRequest("POST", api.users.getOrCreate.path, {
        walletAddress: publicAddress,
        role: selectedRole
      });
      
      const user = await res.json();
      
      setWalletAddress(user.walletAddress);
      setRole(user.role);
      
      localStorage.setItem("wallet_address", user.walletAddress);
      localStorage.setItem("user_role", user.role);

      toast({
        title: "Wallet Connected",
        description: `Connected as ${selectedRole}`,
        className: "border-primary/50 text-foreground bg-background/95 backdrop-blur-md",
      });

      // Prefetch user data
      queryClient.invalidateQueries({ queryKey: [api.users.get.path, user.walletAddress] });

      // Handle real wallet disconnect
      window.solana.on('disconnect', () => {
        disconnect();
      });

    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Could not connect to Solana wallet.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setWalletAddress(null);
    setRole(null);
    localStorage.removeItem("wallet_address");
    localStorage.removeItem("user_role");
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
      role,
      connect,
      disconnect,
      isLoading
    }}>
      {children}
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
