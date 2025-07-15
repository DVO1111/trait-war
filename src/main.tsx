import { createRoot } from 'react-dom/client'
import { WalletConnectionProvider } from './components/WalletProvider.tsx'
import { ThemeProvider } from 'next-themes'
import { applyCspHeaders } from './lib/security.ts'
import App from './App.tsx'
import './index.css'

// Apply security headers
applyCspHeaders();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <WalletConnectionProvider>
      <App />
    </WalletConnectionProvider>
  </ThemeProvider>
);
