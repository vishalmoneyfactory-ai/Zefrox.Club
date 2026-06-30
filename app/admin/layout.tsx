import AdminNavbar from '@/components/layout/AdminNavbar';
import AdminSidebar from '@/components/layout/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 overflow-x-hidden">
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 md:ml-64 pt-16 relative z-10">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
