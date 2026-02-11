import { PublicKey } from "@solana/web3.js";
import { SERVER_CONFIG } from "@shared/config";

const REQUIRED_ENV_KEYS = ["DATABASE_URL"];

const isValidPublicKey = (value?: string) => {
  if (!value) return false;
  try {
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
};

export function validateServerConfiguration() {
  const missing = REQUIRED_ENV_KEYS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  if (!Array.isArray(SERVER_CONFIG.SOLANA_RPC_ENDPOINTS) || SERVER_CONFIG.SOLANA_RPC_ENDPOINTS.length === 0) {
    throw new Error("SOLANA_RPC_ENDPOINTS must include at least one RPC URL");
  }

  SERVER_CONFIG.SOLANA_RPC_ENDPOINTS.forEach((endpoint, index) => {
    if (!endpoint.startsWith("http://") && !endpoint.startsWith("https://")) {
      throw new Error(`Invalid SOLANA_RPC_ENDPOINTS[${index}] URL: ${endpoint}`);
    }
  });

  if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is required in production");
  }

  if (SERVER_CONFIG.SMART_CONTRACT_ENABLED) {
    const programId = process.env.SMART_CONTRACT_PROGRAM_ID;
    if (!isValidPublicKey(programId)) {
      throw new Error("SMART_CONTRACT_ENABLED=true requires SMART_CONTRACT_PROGRAM_ID as a valid Solana public key");
    }
  }
}
