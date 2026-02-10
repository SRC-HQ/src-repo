import './globals.css';
import { ClientWalletProvider } from '../components/ClientWalletProvider';

export const metadata = {
  title: 'Sperm Race E2E Dummy',
  description: 'End-to-end testing dummy app (local only, not deployed).',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ClientWalletProvider>{children}</ClientWalletProvider>
      </body>
    </html>
  );
}
