'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Menu } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background relative overflow-x-hidden">
        {/* Overlay for mobile */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        {/* Toggle button - visible when sidebar is closed OR on mobile when sidebar is closed */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-6 left-6 z-30 p-2 bg-sidebar-bg text-white rounded-lg hover:bg-sidebar-bg/90 transition-all shadow-lg border border-white/10 cursor-pointer"
          >
            <Menu size={24} />
          </button>
        )}

        <main className={`flex-1 ${isSidebarOpen && !isMobile ? 'ml-64' : 'ml-0'} p-4 md:p-8 overflow-y-auto transition-all duration-300 ease-in-out w-full`}>
          <div className={`max-w-7xl mx-auto ${!isSidebarOpen || isMobile ? 'pt-16 md:pt-0' : ''}`}>
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
