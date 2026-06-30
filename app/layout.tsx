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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background antialiased text-foreground overflow-x-hidden">
        {/* Global Aurora Background */}
        <div className="aurora-bg">
          <div className="aurora-blob aurora-blob-1"></div>
          <div className="aurora-blob aurora-blob-2"></div>
          <div className="aurora-blob aurora-blob-3"></div>
        </div>

        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

