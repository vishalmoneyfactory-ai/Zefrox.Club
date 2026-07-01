import AdminNavbar from '@/components/layout/AdminNavbar';
import AdminSidebar from '@/components/layout/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-screen bg-[#020617] text-slate-100 overflow-x-hidden relative">
      <div className="aurora-bg">
        <div className="aurora-blob aurora-blob-1"></div>
        <div className="aurora-blob aurora-blob-2"></div>
        <div className="aurora-blob aurora-blob-3"></div>
      </div>
      <AdminNavbar />
      <div className="flex relative z-10">
        <AdminSidebar />
        <main className="flex-1 md:ml-64 pt-16">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
