import { Keypair } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";



const SOLANA_KEYPAIR_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE || "",
  ".config",
  "solana",
  "id.json"
);

  const secretKeyString = fs.readFileSync(filePath, "utf8");
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  return Keypair.fromSecretKey(secretKey);
}

export const adminKeypair = loadKeypairFromFile();
export const walletKeypair = adminKeypair;


export const walletKeypair = adminKeypair;

