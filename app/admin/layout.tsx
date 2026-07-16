import AdminNavbar from '@/components/layout/AdminNavbar';
import AdminSidebar from '@/components/layout/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-slate-800 overflow-x-hidden relative font-sans" style={{ background: 'transparent' }}>
      <AdminNavbar />
      <div className="flex relative z-10 pt-16 w-full max-w-[100vw]">
        <AdminSidebar />
        <main className="flex-1 min-w-0 md:ml-64 relative min-h-[calc(100vh-4rem)] w-full">
          <div className="p-4 sm:p-6 lg:p-8 max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
