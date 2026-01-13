import { Connection } from "@solana/web3.js";
import { CONFIG } from "@shared/config";
import memoize from "memoizee";

const getSolanaConnectionRaw = async () => {
  const endpoints = CONFIG.SOLANA_RPC_ENDPOINTS || ["https://api.mainnet-beta.solana.com"];
  for (const endpoint of endpoints) {
    try {
      const connection = new Connection(endpoint, 'confirmed');
      await connection.getSlot();
      return connection;
    } catch (err) {
      console.warn(`RPC Failover: ${endpoint} failed, trying next...`);
    }
  }
  throw new Error("All Solana RPC endpoints failed");
};

export const getSolanaConnection = memoize(getSolanaConnectionRaw, { 
  promise: true, 
  maxAge: 60000 // Cache connection for 1 minute
});
