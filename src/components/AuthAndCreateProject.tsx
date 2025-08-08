// AuthAndCreateProject.tsx

import React, { useCallback } from "react";
import base58 from "bs58";
import { useWallet } from "@solana/wallet-adapter-react";
import { client } from "../constants/client";
import { sendClientTransactions } from "@honeycomb-protocol/edge-client/client/walletHelpers";

const AuthAndCreateProject = () => {
  const wallet = useWallet();

  const handleAuthAndCreate = useCallback(async () => {
    if (!wallet || !wallet.publicKey || !wallet.signMessage) {
      console.error("Wallet not connected or signMessage not supported");
      return;
    }

    try {
      // Step 1: Auth Request
      const {
        authRequest: { message: authMessage },
      } = await client.authRequest({
        wallet: wallet.publicKey.toString(),
      });

      // Step 2: Sign the auth message
      const encodedMessage = new TextEncoder().encode(authMessage);
      const signedMessage = await wallet.signMessage(encodedMessage);
      const signature = base58.encode(signedMessage);

      // Step 3: Confirm auth and get token
      const {
        authConfirm: { accessToken },
      } = await client.authConfirm({
        wallet: wallet.publicKey.toString(),
        signature,
      });

      // Step 4: Create project transaction
      const txResponse = await client.createCreateProjectTransaction(
        {
          name: "My New Project",
          payer: wallet.publicKey.toString(),
          authority: wallet.publicKey.toString(), // required
        },
        {
          fetchOptions: {
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          },
        }
      );

      // ✅ Extract ONLY the transaction from the response
      const { createCreateProjectTransaction } = txResponse;
      const { tx } = createCreateProjectTransaction;
        if (!createCreateProjectTransaction) {
            throw new Error("Failed to create project transaction");
        }
      // Step 5: Send transaction
      const result = await sendClientTransactions(client, wallet,tx);

      console.log("✅ Transaction sent successfully:", result);
    } catch (error) {
      console.error("🔥 Error during auth + create project:", error);
    }
  }, [wallet]);

  return <button onClick={handleAuthAndCreate}>Auth & Create Project</button>;
};

export default AuthAndCreateProject;

