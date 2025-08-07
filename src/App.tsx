<<<<<<< HEAD
import TestProject from "./pages/TestProject";
import MyProjects from "./pages/MyProjects";
=======
import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import {
  WalletModalProvider,
} from "@solana/wallet-adapter-react-ui";

>>>>>>> 05ea7109d9aa30c220981377e75d1c983ff2fa39
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { GameLayout } from "@/components/GameLayout";
import Index from "./pages/Index";
import WalletAuth from "./pages/WalletAuth";
import Missions from "./pages/Missions";
import DAO from "./pages/DAO";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";
import Creator from "./pages/Creator";
import Blockchain from "./pages/Blockchain";
import NotFound from "./pages/NotFound";

// Default styles for wallet modal
import "@solana/wallet-adapter-react-ui/styles.css";

const queryClient = new QueryClient();

<<<<<<< HEAD
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<WalletAuth />} />
          <Route path="/" element={<Index />} />
          <Route path="/missions" element={<GameLayout><Missions /></GameLayout>} />
          <Route path="/dao" element={<GameLayout><DAO /></GameLayout>} />
          <Route path="/leaderboard" element={<GameLayout><Leaderboard /></GameLayout>} />
          <Route path="/creator" element={<GameLayout><Creator /></GameLayout>} />
          <Route path="/blockchain" element={<GameLayout><Blockchain /></GameLayout>} />
          <Route path="/settings" element={<GameLayout><Settings /></GameLayout>} />
          <Route path="/test" element={<GameLayout><TestProject /></GameLayout>} />
          <Route path="/my-projects" element={<GameLayout><MyProjects /></GameLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
=======
const App = () => {
  const network = "https://rpc.test.honeycombprotocol.com";
  const endpoint = useMemo(() => network, [network]);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter()],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/auth" element={<WalletAuth />} />
                  <Route path="/" element={<Index />} />
                  <Route path="/missions" element={<GameLayout><Missions /></GameLayout>} />
                  <Route path="/dao" element={<GameLayout><DAO /></GameLayout>} />
                  <Route path="/leaderboard" element={<GameLayout><Leaderboard /></GameLayout>} />
                  <Route path="/creator" element={<GameLayout><Creator /></GameLayout>} />
                  <Route path="/blockchain" element={<GameLayout><Blockchain /></GameLayout>} />
                  <Route path="/settings" element={<GameLayout><Settings /></GameLayout>} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </QueryClientProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
>>>>>>> 05ea7109d9aa30c220981377e75d1c983ff2fa39

export default App;
