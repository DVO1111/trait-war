import { client } from "../constants/client.ts";
import { walletKeypair } from "../constants/wallet.ts";
import { sendClientTransactions } from "@honeycomb-protocol/edge-client/client/walletHelpers.js";

async function createProfileTree() {
  try {
    const publicKey = walletKeypair.publicKey.toBase58();
    console.log("🔑 Authority Public Key:", publicKey);

    const { createCreateProfilesTreeTransaction: txResponse } =
      await client.createCreateProfilesTreeTransaction({
        project: "YOUR_PROJECT_ADDRESS", // Replace with your actual project address string
        payer: publicKey,
        authority: publicKey,
        treeConfig: {
          basic: {
            numAssets: 100000,
          },
        },
      });

    const result = await sendClientTransactions(
      client,
      {
        publicKey: walletKeypair.publicKey,
        signTransaction: async (tx) => {
          tx.partialSign(walletKeypair);
          return tx;
        },
        signAllTransactions: async (txs) => {
          txs.forEach((tx) => tx.partialSign(walletKeypair));
          return txs;
        },
      },
      txResponse
    );

    console.log("✅ Profile tree created successfully:", result);
  } catch (error) {
    console.error("❌ Error creating profile tree:", error);
  }
}

createProfileTree();
