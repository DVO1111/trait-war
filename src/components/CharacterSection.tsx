// src/components/CharacterSection.tsx
import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { client } from "@/constants/client"; // make sure this file exports client
import { Button } from "@/components/ui/button";

const PROJECT_ID = (import.meta.env.VITE_PROJECT_ID as string) || "REPLACE_WITH_PROJECT_ID";

type AnyObj = Record<string, any>;

export default function CharacterSection() {
  const wallet = useWallet();
  const [profiles, setProfiles] = useState<AnyObj[]>([]);
  const [characters, setCharacters] = useState<AnyObj[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [loadingCharacters, setLoadingCharacters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // if wallet not connected, clear state
    if (!wallet?.publicKey) {
      setProfiles([]);
      setCharacters([]);
      return;
    }

    const pub = wallet.publicKey.toBase58();

    const fetchData = async () => {
      setError(null);

      // -------- fetch profiles ----------
      setLoadingProfiles(true);
      try {
        // call findProfiles and defensively extract profile array
        const res: any = await client.findProfiles({
          addresses: [pub],
          projects: [PROJECT_ID],
          includeProof: false,
        });

        console.log("[Honeycomb] findProfiles raw response:", res);

        // the SDK/docs show responses like { profile: [...] }
        const maybeProfiles = res?.profile ?? res?.profiles ?? res?.data?.profile ?? [];
        const normalizedProfiles = Array.isArray(maybeProfiles) ? maybeProfiles : [maybeProfiles];
        setProfiles(Array.isArray(normalizedProfiles) ? normalizedProfiles : []);
      } catch (err: any) {
        console.error("[Honeycomb] findProfiles error:", err);
        setError(String(err?.message ?? err));
        setProfiles([]);
      } finally {
        setLoadingProfiles(false);
      }

      // -------- fetch compressed accounts / characters (best-effort) ----------
      setLoadingCharacters(true);
      try {
        // many example projects use findCompressedAccounts to discover user-owned compressed NFTs etc.
        // we do a defensive extraction similar to profiles above
        const res2: any = await client.findCompressedAccounts({
          addresses: [pub],
        });
        console.log("[Honeycomb] findCompressedAccounts raw response:", res2);

        // SDK vary — try common shapes
        const items = res2?.items ?? res2?.compressedAccounts ?? res2?.data?.items ?? [];
        setCharacters(Array.isArray(items) ? items : []);
      } catch (err: any) {
        // don't treat missing characters as fatal — just log and continue
        console.warn("[Honeycomb] findCompressedAccounts error (non-fatal):", err);
        setCharacters([]);
      } finally {
        setLoadingCharacters(false);
      }
    };

    fetchData();
  }, [wallet?.publicKey]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Blockchain Profiles & Characters</h3>
        <div className="text-sm text-muted-foreground">Project: {PROJECT_ID}</div>
      </div>

      {error && <div className="text-red-600">Error: {error}</div>}

      <section className="p-4 border rounded">
        <h4 className="font-medium mb-2">Profiles</h4>
        {loadingProfiles ? (
          <div>Loading profiles...</div>
        ) : profiles.length === 0 ? (
          <div className="text-sm text-muted-foreground">No profiles found for connected wallet.</div>
        ) : (
          <ul className="space-y-2">
            {profiles.map((p, i) => {
              const key = p.address ?? p.id ?? p.profileAddress ?? i;
              const displayName = p?.info?.name ?? p?.name ?? p?.identity ?? key;
              return (
                <li key={String(key)} className="p-2 border rounded">
                  <div className="text-sm font-medium">{displayName}</div>
                  <div className="text-xs text-muted-foreground">raw: {JSON.stringify(p)}</div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="p-4 border rounded">
        <h4 className="font-medium mb-2">Characters / Compressed Accounts</h4>
        {loadingCharacters ? (
          <div>Loading characters...</div>
        ) : characters.length === 0 ? (
          <div className="text-sm text-muted-foreground">No characters found.</div>
        ) : (
          <ul className="space-y-2">
            {characters.map((c, i) => {
              const key = c.address ?? c.id ?? c.tokenId ?? i;
              const name = c?.name ?? c?.metadata?.name ?? c?.data?.name ?? JSON.stringify(c?.data ?? c);
              return (
                <li key={String(key)} className="p-2 border rounded">
                  <div className="font-medium text-sm">{name}</div>
                  <div className="text-xs text-muted-foreground">raw: {JSON.stringify(c)}</div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="flex gap-2">
        <Button
          onClick={() => {
            // quick helper to re-run the effect (just touch publicKey to force re-render).
            // in a real app you'd expose a proper refresh function.
            window.location.reload();
          }}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
}