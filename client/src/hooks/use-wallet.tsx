import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  userId: number | null;
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
  const [userId, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState<"user" | "advertiser" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load from local storage on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem("wallet_address");
    const savedRole = localStorage.getItem("user_role") as "user" | "advertiser";
    const savedId = localStorage.getItem("user_id");
    if (savedAddress && savedRole) {
      setWalletAddress(savedAddress);
      setRole(savedRole);
      if (savedId) setUserId(parseInt(savedId));
    }
  }, []);

  const connect = async (selectedRole: "user" | "advertiser") => {
    setIsLoading(true);
    try {
      console.log("Connecting to Solana wallet...");
      // Try multiple ways to find the provider
      const solanaInstance = (window as any).phantom?.solana || (window as any).solana;
      
      if (!solanaInstance) {
        toast({
          title: "Phantom Not Found",
          description: "Please install the Phantom wallet extension or unlock it to continue.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      console.log("Found provider, calling connect...");
      const response = await solanaInstance.connect();
      
      const publicAddress = response.publicKey.toString();
      console.log("Wallet connected:", publicAddress);
      
      // Auth with backend
      const res = await fetch('/api/users/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicAddress,
          role: selectedRole
        })
      });
      
      if (!res.ok) throw new Error("Backend authentication failed");
      const user = await res.json();
      
      setWalletAddress(user.walletAddress);
      setRole(user.role);
      setUserId(user.id);
      
      localStorage.setItem("wallet_address", user.walletAddress);
      localStorage.setItem("user_role", user.role);
      localStorage.setItem("user_id", user.id.toString());

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

    } catch (error: any) {
      console.error("Connection error detail:", error);
      // Detailed logging for debugging
      if (error?.message) console.log("Error message:", error.message);
      if (error?.code) console.log("Error code:", error.code);
      
      toast({
        title: "Connection Failed",
        description: error.message || "Could not connect to Solana wallet. Please check if Phantom is unlocked.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setWalletAddress(null);
    setRole(null);
    setUserId(null);
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
