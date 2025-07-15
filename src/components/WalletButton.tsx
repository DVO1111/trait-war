import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';

export const WalletButton = () => {
  const { connected, publicKey } = useWallet();

  if (connected && publicKey) {
    return (
      <Button variant="gaming" className="text-sm">
        {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
      </Button>
    );
  }

  return <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90 !rounded-lg !font-medium !text-sm !px-4 !py-2" />;
};