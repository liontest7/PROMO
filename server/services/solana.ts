import { Connection, Keypair, PublicKey, Transaction, SystemProgram, TransactionInstruction, sendAndConfirmTransaction } from "@solana/web3.js";
import { SERVER_CONFIG } from "@shared/config";
import { getMint, getOrCreateAssociatedTokenAccount, createTransferInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import memoize from "memoizee";
import bs58 from "bs58";
import { createHash } from "crypto";

const NATIVE_SOL_MINT = "So11111111111111111111111111111111111111112";

const getSolanaConnectionRaw = async () => {
  const endpoints = SERVER_CONFIG.SOLANA_RPC_ENDPOINTS;
  for (const endpoint of endpoints) {
    try {
      const connection = new Connection(endpoint, {
        commitment: "confirmed",
        confirmTransactionInitialTimeout: 30000,
      });
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
  maxAge: 60000,
});

const getTokenDecimals = memoize(
  async (tokenAddress: string) => {
    const connection = await getSolanaConnection();
    const mint = await getMint(connection, new PublicKey(tokenAddress));
    return mint.decimals;
  },
  { promise: true, maxAge: 10 * 60 * 1000, normalizer: ([tokenAddress]) => tokenAddress },
);

const toBaseUnits = (amount: number, decimals: number): bigint => {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Transfer amount must be greater than zero");
  }

  const [whole, fractional = ""] = amount.toString().split(".");
  const normalizedFractional = fractional.padEnd(decimals, "0").slice(0, decimals);
  const baseUnitsAsString = `${whole}${normalizedFractional}`.replace(/^0+(?=\d)/, "");
  return BigInt(baseUnitsAsString || "0");
};

export async function transferTokens(
  toWallet: string,
  amount: number,
  tokenAddress: string,
  fromKeypair: Keypair,
): Promise<string> {
  const connection = await getSolanaConnection();
  const toPublicKey = new PublicKey(toWallet);

  if (tokenAddress === NATIVE_SOL_MINT) {
    const balance = await connection.getBalance(fromKeypair.publicKey);
    const lamportsToSend = toBaseUnits(amount, 9);
    if (BigInt(balance) < lamportsToSend + BigInt(5000)) {
      throw new Error("System wallet SOL balance too low for transfer and fees");
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toPublicKey,
        lamports: Number(lamportsToSend),
      }),
    );

    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromKeypair.publicKey;

    return await sendAndConfirmTransaction(connection, transaction, [fromKeypair], {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    });
  }

  const mintPublicKey = new PublicKey(tokenAddress);
  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    fromKeypair,
    mintPublicKey,
    fromKeypair.publicKey,
  );

  const toTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    fromKeypair,
    mintPublicKey,
    toPublicKey,
  );

  const balance = await connection.getBalance(fromKeypair.publicKey);
  if (balance < 10000) {
    throw new Error("System wallet SOL balance too low for SPL transfer fees");
  }

  const decimals = await getTokenDecimals(tokenAddress);
  const amountInBaseUnits = toBaseUnits(amount, decimals);
  if (amountInBaseUnits <= BigInt(0)) {
    throw new Error("Calculated token amount is zero after decimal normalization");
  }

  const transaction = new Transaction().add(
    createTransferInstruction(
      fromTokenAccount.address,
      toTokenAccount.address,
      fromKeypair.publicKey,
      amountInBaseUnits,
      [],
      TOKEN_PROGRAM_ID,
    ),
  );

  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = fromKeypair.publicKey;

  return await sendAndConfirmTransaction(connection, transaction, [fromKeypair], {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });
}

export async function claimFromSmartContract(
  campaignId: number,
  userWallet: string,
  amount: number,
  claimNonce: string,
): Promise<string> {
  if (!SERVER_CONFIG.SMART_CONTRACT_ENABLED) {
    throw new Error("Smart contract integration is not enabled yet");
  }

  const programIdValue = process.env.SMART_CONTRACT_PROGRAM_ID;
  if (!programIdValue) {
    throw new Error("SMART_CONTRACT_PROGRAM_ID is required when smart contract is enabled");
  }

  const systemPrivateKey = process.env.SYSTEM_WALLET_PRIVATE_KEY;
  if (!systemPrivateKey) {
    throw new Error("SYSTEM_WALLET_PRIVATE_KEY is required for smart contract claims");
  }

  const normalizedAmount = Math.round(amount * 1_000_000);
  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    throw new Error(`Invalid claim amount: ${amount}`);
  }

  const connection = await getSolanaConnection();
  const programId = new PublicKey(programIdValue);
  const recipientPubkey = new PublicKey(userWallet.trim());
  const signer = Keypair.fromSecretKey(bs58.decode(systemPrivateKey.trim()));

  const nonceHash = createHash("sha256").update(claimNonce).digest();
  const nonce = nonceHash.readBigUInt64LE(0);

  // Borsh payload for DropyInstruction::ClaimReward { campaign_id: u64, amount: u64, nonce: u64 }
  // enum variant index: 2 (InitializeCampaign=0, DepositRewards=1, ClaimReward=2, CloseCampaign=3)
  const data = Buffer.alloc(25);
  data.writeUInt8(2, 0);
  data.writeBigUInt64LE(BigInt(campaignId), 1);
  data.writeBigUInt64LE(BigInt(normalizedAmount), 9);
  data.writeBigUInt64LE(nonce, 17);

  const ix = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: signer.publicKey, isSigner: true, isWritable: false },
      { pubkey: recipientPubkey, isSigner: false, isWritable: false },
    ],
    data,
  });

  const transaction = new Transaction().add(ix);
  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = signer.publicKey;

  return await sendAndConfirmTransaction(connection, transaction, [signer], {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });
}
