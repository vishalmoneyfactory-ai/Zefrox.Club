
import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import SupportModal from '@/components/features/SupportModal';

const appName = 'Zerofx.club';

export const metadata: Metadata = {
  title: 'Zerofx.club',
  openGraph: {
    title: 'Zerofx.club',
    description: 'Broker',
  },
  description: 'Broker',
  keywords: ['payment', 'management', 'trading', 'accounts', 'secure', 'admin'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased overflow-x-hidden text-slate-900" style={{ background: '#f0f4ff' }}>
        {/* Animated ambient orbs */}
        <div className="light-orbs" aria-hidden="true">
          <div className="light-orb-1" />
          <div className="light-orb-2" />
          <div className="light-orb-3" />
        </div>
        <ToastProvider>
          {children}
          <SupportModal />
        </ToastProvider>
      </body>
    </html>
  );
}
