import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  userId: number | null;
  role: "user" | "advertiser" | null;
  connect: (role: "user" | "advertiser") => Promise<void>;
  disconnect: () => void;
  isLoading: boolean;
  solBalance: number | null;
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
      // Fallback to devnet if mainnet fails (for development environment)
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

  // Load from local storage on mount
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

  const connect = async (selectedRole: "user" | "advertiser") => {
    setIsLoading(true);
    try {
      console.log("Connecting to Solana wallet...");
      
      // Standard Solana providers to check
      const providers = [
        { name: 'Solflare', provider: (window as any).solflare?.solana },
        { name: 'Phantom', provider: (window as any).phantom?.solana },
        { name: 'Bybit', provider: (window as any).bybitWallet?.solana },
        { name: 'Solana', provider: (window as any).solana }
      ].filter(p => p.provider && p.provider.connect);

      // Force a disconnect from any previously connected session to trigger the picker
      // and explicitly check for multiple providers.
      let solanaInstance = (window as any).solana;

      // Check if we can find a non-Phantom provider if that's what's currently "dominating" window.solana
      const solflare = (window as any).solflare?.solana;
      const bybit = (window as any).bybitWallet?.solana;
      const phantom = (window as any).phantom?.solana;

      // If the user has multiple extensions, some (like Phantom) might auto-connect.
      // We'll try to use the most generic one first to see if it triggers the picker.
      if (!solanaInstance || !solanaInstance.connect) {
        solanaInstance = providers[0]?.provider;
      }
      
      if (solanaInstance) {
        // Try to force the selection dialog by passing onlyIfTrusted: false
        // and ensuring we aren't just resuming an old session.
        console.log("Calling connect with onlyIfTrusted: false");
        const response = await solanaInstance.connect({ onlyIfTrusted: false });
        
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
        fetchBalance(user.walletAddress);
        
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
        if (solanaInstance && solanaInstance.on) {
          solanaInstance.on('disconnect', () => {
            disconnect();
          });
        }
        
        setIsLoading(false);
        return;
      } else {
        toast({
          title: "Wallet Not Found",
          description: "Please install a Solana wallet extension (Phantom, Solflare, etc.) or unlock it to continue.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

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
      solBalance
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
