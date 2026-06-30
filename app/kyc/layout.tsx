import UserNavbar from '@/components/layout/UserNavbar';
import UserSidebar from '@/components/layout/UserSidebar';

export default function KycLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 overflow-x-hidden">
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
