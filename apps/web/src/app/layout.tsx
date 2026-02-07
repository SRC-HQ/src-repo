import './globals.css';
import { ClientWalletProvider } from '../components/providers/ClientWalletProvider';

export const metadata = {
  title: 'Sperm Race Club',
  description: 'The most competitive race of all time.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className="antialiased selection:bg-primary selection:text-black"
        suppressHydrationWarning
      >
        <ClientWalletProvider>{children}</ClientWalletProvider>
      </body>
    </html>
  );
}
