import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameLayout } from "@/components/GameLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import WalletAuth from "./pages/WalletAuth";
import Missions from "./pages/Missions";
import DAO from "./pages/DAO";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";
import Creator from "./pages/Creator";
import Blockchain from "./pages/Blockchain";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/wallet-auth" element={<WalletAuth />} />
          <Route path="/" element={<Index />} />
          <Route path="/missions" element={<ProtectedRoute><GameLayout><Missions /></GameLayout></ProtectedRoute>} />
          <Route path="/dao" element={<ProtectedRoute><GameLayout><DAO /></GameLayout></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><GameLayout><Leaderboard /></GameLayout></ProtectedRoute>} />
          <Route path="/creator" element={<ProtectedRoute><GameLayout><Creator /></GameLayout></ProtectedRoute>} />
          <Route path="/blockchain" element={<ProtectedRoute><GameLayout><Blockchain /></GameLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><GameLayout><Settings /></GameLayout></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
