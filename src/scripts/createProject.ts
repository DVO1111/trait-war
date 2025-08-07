// filepath: c:\Users\HP\Documents\trait-war\src\scripts\createProject.ts
import pkg from "@honeycomb-protocol/edge-client";
const { sendAndConfirmTransaction, client, loadKeypair } = pkg;
import { Connection, PublicKey } from "@solana/web3.js";
import * as honeycomb from "@honeycomb-protocol/edge-client";

const RPC_URL = "https://rpc.test.honeycombprotocol.com"; 
const connection = new Connection(RPC_URL);

const adminKeypair = loadKeypair(); 
const projectAddress = new PublicKey("YOUR_PROJECT_ADDRESS"); 

async function createProfilesTree() {
  try {
    const { createCreateProfilesTreeTransaction: txResponse } =
      await client.createCreateProfilesTreeTransaction({
        payer: adminKeypair.publicKey.toString(),
        project: projectAddress.toString(),
        treeConfig: {
          basic: {
            numAssets: 100000, 
          },
        },
      });

    console.log("Transaction Response:", txResponse); 

    const { signature } = await sendAndConfirmTransaction({
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

console.log(honeycomb);

createProfilesTree();