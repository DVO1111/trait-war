// src/scripts/createProject.ts
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { readFileSync } from "fs";
import path from "path";
import { sendClientTransactions } from "@honeycomb-protocol/edge-client/client/walletHelpers";
import { createEdgeClient } from "@honeycomb-protocol/edge-client";

// --- 1. Setup constants
const RPC_URL = "https://rpc.test.honeycombprotocol.com";
const EDGE_API_URL = "https://edge.main.honeycombprotocol.com";
const PROJECT_ID = "YOUR_PROJECT_ID"; // <-- Replace this with your actual project address
const PROJECT_NAME = "Test Trait War Project";

// --- 2. Load Solana Keypair from local path
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

// --- 3. Set up dependencies
const connection = new Connection(RPC_URL);
const client = createEdgeClient(EDGE_API_URL, true);
const adminKeypair = loadKeypair();
const projectAddress = new PublicKey(PROJECT_ID);

// --- 4. Create Profiles Tree
async function createProfilesTree() {
  try {
    const { createCreateProfilesTreeTransaction: txResponse } = await client.createCreateProfilesTreeTransaction({
      payer: adminKeypair.publicKey.toBase58(),
      project: projectAddress.toBase58(),
      treeConfig: {
        basic: {
          numAssets: 100000,
        },
      },
    });

    console.log("Transaction built. Sending...");

    const walletAdapter = {
      publicKey: adminKeypair.publicKey,
      signTransaction: async (tx: any) => {
        tx.partialSign(adminKeypair);
        return tx;
      },
      signAllTransactions: async (txs: any[]) => {
        txs.forEach(tx => tx.partialSign(adminKeypair));
        return txs;
      }
    };

    const result = await sendClientTransactions(client, walletAdapter, txResponse.tx);

    console.log("✅ Profiles tree created!");
    console.log("🔗 Transaction Result:", result);
  } catch (error) {
    console.error("❌ Failed to create profiles tree:", error);
  }
}

createProfilesTree();
