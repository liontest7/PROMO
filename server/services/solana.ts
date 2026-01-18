import { Connection, Keypair, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } from "@solana/web3.js";
import { CONFIG } from "@shared/config";
import { getOrCreateAssociatedTokenAccount, createTransferInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import memoize from "memoizee";

const getSolanaConnectionRaw = async () => {
  const endpoints = CONFIG.SOLANA_RPC_ENDPOINTS || ["https://api.mainnet-beta.solana.com"];
  for (const endpoint of endpoints) {
    try {
      const connection = new Connection(endpoint, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 30000
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
  maxAge: 60000 // Cache connection for 1 minute
});

export async function transferTokens(
  toWallet: string,
  amount: number,
  tokenAddress: string,
  fromKeypair: Keypair
): Promise<string> {
  const connection = await getSolanaConnection();
  const toPublicKey = new PublicKey(toWallet);
  const mintPublicKey = new PublicKey(tokenAddress);

  if (tokenAddress === "So11111111111111111111111111111111111111112") {
    // Native SOL transfer
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toPublicKey,
        lamports: Math.round(amount * 1e9),
      })
    );
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromKeypair.publicKey;
    
    return await sendAndConfirmTransaction(connection, transaction, [fromKeypair], {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed'
    });
  } else {
    // SPL Token transfer
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromKeypair,
      mintPublicKey,
      fromKeypair.publicKey
    );

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromKeypair,
      mintPublicKey,
      toPublicKey
    );

    const transaction = new Transaction().add(
      createTransferInstruction(
        fromTokenAccount.address,
        toTokenAccount.address,
        fromKeypair.publicKey,
        amount * Math.pow(10, 6), // Assuming 6 decimals for common SPL tokens
        [],
        TOKEN_PROGRAM_ID
      )
    );

    // Set recent blockhash for reliable transaction
    const { blockhash } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromKeypair.publicKey;

    return await sendAndConfirmTransaction(connection, transaction, [fromKeypair], {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed'
    });
  }
}
