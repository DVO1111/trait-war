import { Keypair } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

const SOLANA_KEYPAIR_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE || "",
  ".config",
  "solana",
  "id.json"
);

// Function to load keypair
function loadKeypairFromFile(): Keypair {
  const secretKeyString = fs.readFileSync(SOLANA_KEYPAIR_PATH, "utf8");
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  return Keypair.fromSecretKey(secretKey);
}

export const adminKeypair = loadKeypairFromFile();
export const walletKeypair = adminKeypair;
