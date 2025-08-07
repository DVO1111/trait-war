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
        // Replace with an existing client method that fetches projects by authority
        // Example: using findCompressedAccounts or another appropriate method
        const result = await client.findCompressedAccounts({
          addresses: [publicKey.toBase58()],
        });
        console.log(result); // ADD THIS LINE TO INSPECT THE RESPONSE
        // Adjust the property below to match the actual structure of FindCompressedAccountsQuery
        setProjects(result.items || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
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
          {projects.map((project) => (
            <li key={project.id}>
              <strong>{project.name}</strong> <br />
              ID: <code className="text-xs">{project.id}</code>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
