import React from 'react';
import UserNavbar from '@/components/layout/UserNavbar';
import UserSidebar from '@/components/layout/UserSidebar';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function AccountsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const user = verifyToken(token);
  if (!user) {
    redirect('/login');
  }

  const kyc = await prisma.kyc.findUnique({
    where: { userId: user.userId },
  });

  if (!kyc) {
    redirect('/kyc');
  }

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-200 flex">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-[20%] right-[-20%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <UserNavbar />
      <UserSidebar />
      
      <main className="md:ml-64 pt-16 min-h-screen relative z-10 p-4 sm:p-6 lg:p-8 min-w-0 w-full">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
