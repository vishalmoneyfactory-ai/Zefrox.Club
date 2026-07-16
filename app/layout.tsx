import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

const appName = 'Zerofx.club';

export const metadata: Metadata = {
  title: `${appName} — Secure Payment Management`,
  description: `${appName} is a secure, admin-verified payment management platform. Submit KYC, track payments, and manage transactions with ease.`,
  keywords: ['payment', 'management', 'KYC', 'verification', 'secure', 'admin'],
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
        </ToastProvider>
      </body>
    </html>
  );
}
