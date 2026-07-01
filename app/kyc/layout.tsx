import UserNavbar from '@/components/layout/UserNavbar';
import UserSidebar from '@/components/layout/UserSidebar';

export default function KycLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden relative">
      <UserNavbar />
      <div className="flex relative z-10">
        <UserSidebar />
        <main className="flex-1 md:ml-64 pt-16">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
