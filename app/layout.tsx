import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Zerofx.club';

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
      <body className="min-h-screen bg-slate-50 antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

