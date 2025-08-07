import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { client } from "@/constants/client";

export default function MyProjects() {
  const { publicKey } = useWallet();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!publicKey) return;

      setLoading(true);
      try {
        const result = await client.findCompressedAccounts({
          addresses: [publicKey.toBase58()],
        });

        console.log("Compressed accounts result:", result);

        // Check the actual structure of result before setting state
        if (Array.isArray(result)) {
          setProjects(result); // If it's an array
        } else if ("items" in result && Array.isArray(result.items)) {
          setProjects(result.items); // Fallback if result has `.items`
        } else {
          console.warn("Unexpected result format:", result);
          setProjects([]);
        }

      } catch (error) {
        console.error("Error fetching projects:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [publicKey]);

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">My Projects</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-2">
          {projects.map((project, index) => (
            <li key={project.id ?? index}>
              <strong>{project.name ?? "Unnamed Project"}</strong> <br />
              ID: <code className="text-xs">{project.id ?? "N/A"}</code>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
