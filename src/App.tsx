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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
          <Route path="/settings" element={<GameLayout><Settings /></GameLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
