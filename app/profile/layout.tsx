import UserNavbar from '@/components/layout/UserNavbar';
import UserSidebar from '@/components/layout/UserSidebar';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-slate-800 overflow-x-hidden relative font-sans" style={{ background: 'transparent' }}>
      <UserNavbar />
      <div className="flex relative z-10 pt-16 w-full max-w-[100vw]">
        <UserSidebar />
        <main className="flex-1 min-w-0 md:ml-64 relative min-h-[calc(100vh-4rem)] w-full">
          <div className="p-4 sm:p-6 lg:p-8 max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
