import { createRoot } from 'react-dom/client'
import { WalletConnectionProvider } from './components/WalletProvider.tsx'
import { ThemeProvider } from 'next-themes'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <WalletConnectionProvider>
      <App />
    </WalletConnectionProvider>
  </ThemeProvider>
);
