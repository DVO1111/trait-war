// src/scripts/createProfilesTree.ts

import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { readFileSync } from "fs";
import path from "path";
import { client } from "../constants/client";
import { CreateCreateProfilesTreeTransactionQuery } from "@honeycomb-protocol/edge-client";

// --- Constants
const RPC_URL = "https://rpc.test.honeycombprotocol.com";
const PROJECT_ID = "YOUR_PROJECT_ID"; // Replace with actual project ID

// --- Load keypair
function loadKeypair(): Keypair {
  const SOLANA_KEYPAIR_PATH = path.join(
    process.env.HOME || process.env.USERPROFILE || "",
    ".config",
    "solana",
    "id.json"
  );
  const secretKeyString = readFileSync(SOLANA_KEYPAIR_PATH, "utf8");
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  return Keypair.fromSecretKey(secretKey);
}

// --- Setup
const connection = new Connection(RPC_URL, "confirmed");
const adminKeypair = loadKeypair();
const projectAddress = new PublicKey(PROJECT_ID);

// --- Create Profiles Tree
async function createProfilesTree() {
  try {
    const txResponse = await client.createCreateProfilesTreeTransaction({
      payer: adminKeypair.publicKey.toBase58(),
      project: projectAddress.toBase58(),
      treeConfig: {
        basic: {
          numAssets: 100000,
        },
      },
    });

    console.log("Transaction built. Sending...");

    const signature = sendAndConfirmTransaction({
      connection,
      transactionResponse: txResponse,
      signers: [adminKeypair],
    });

    console.log("✅ Profiles tree created!");
    console.log("🔗 Transaction Signature:", signature);
  } catch (error) {
    console.error("❌ Failed to create profiles tree:", error);
  }
}

createProfilesTree(); // ✅ This should be at the end

function sendAndConfirmTransaction(arg0: { connection: Connection; transactionResponse: CreateCreateProfilesTreeTransactionQuery; signers: Keypair[]; }) {
  throw new Error("Function not implemented.");
}

