import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useState } from "react";
import { sendClientTransactions } from "@honeycomb-protocol/edge-client/client/walletHelpers";
import { client } from "@/constants/client";
import { Button } from "@/components/ui/button";

export default function TestProject() {
  const { publicKey, connected, signTransaction, sendTransaction } = useWallet();
  const [status, setStatus] = useState("idle");

  const createProject = useCallback(async () => {
    if (!connected || !publicKey) {
      alert("Wallet not connected");
      return;
    }

    setStatus("creating...");

    try {
      const {
        createCreateProjectTransaction: { tx },
      } = await client.createCreateProjectTransaction({
        name: "Test Trait War Project",
        authority: publicKey.toBase58(),
      });

      const result = await sendClientTransactions(client, { publicKey, signTransaction, sendTransaction }, tx);

      console.log("Transaction successful:", result);
      setStatus("✅ Project Created!");
    } catch (err) {
      console.error("Transaction failed:", err);
      setStatus("❌ Failed");
    }
  }, [connected, publicKey, signTransaction, sendTransaction]);

  return (
    <div className="text-center py-10">
      <h1 className="text-xl font-bold mb-4">Create Honeycomb Project</h1>
      <Button variant="gaming" onClick={createProject}>
        🚀 Create Project
      </Button>
      <p className="mt-4">{status}</p>
    </div>
  );
}
