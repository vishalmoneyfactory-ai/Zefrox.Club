import UserNavbar from '@/components/layout/UserNavbar';
import UserSidebar from '@/components/layout/UserSidebar';

export default function KycLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <UserNavbar />
      <div className="flex">
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
