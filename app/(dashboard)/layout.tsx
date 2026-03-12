'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Menu } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background relative">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        {/* Toggle button to open sidebar when closed */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-6 left-6 z-40 p-2 bg-sidebar-bg text-white rounded-lg hover:bg-sidebar-bg/90 transition-all shadow-lg border border-white/10 cursor-pointer"
          >
            <Menu size={24} />
          </button>
        )}

        <main className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-0 pt-20'} p-8 overflow-y-auto transition-all duration-300 ease-in-out`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
