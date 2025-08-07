// filepath: src/scripts/createProfileTree.ts

import { client } from "../constants/client";
import { walletKeypair } from "../constants/wallet";
import sendClientTransactions from "@honeycomb-protocol/edge-client";
import { PublicKey } from "@solana/web3.js";

async function createProfileTree() {
  try {
    const publicKey = walletKeypair.publicKey.toBase58();
    const projectAddress = new PublicKey("YOUR_PROJECT_ADDRESS_HERE"); // 👈 Replace with actual project ID (string or PublicKey)

    console.log("🔑 Authority Public Key:", publicKey);
    console.log("📁 Project:", projectAddress.toBase58());

    // Create transaction for profiles tree
    const txResponse = await client.createCreateProfilesTreeTransaction({
      project: projectAddress.toBase58(),
      payer: publicKey,
      treeConfig: {
        basic: {
          numAssets: 100000,
        },
      },
    });

    // Send and confirm transaction
    // Replace 'API_URL' with your actual API URL string, or import it if defined elsewhere
    const API_URL = "YOUR_API_URL_HERE";
    const result = await sendClientTransactions(
      API_URL,
      true
    );

    console.log("✅ Profile tree created successfully:", result);
  } catch (error) {
    console.error("❌ Error creating profile tree:", error);
  }
}

createProfileTree();
