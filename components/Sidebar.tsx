'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  ReceiptText, 
  PiggyBank, 
  Tags, 
  Settings, 
  LogOut,
  User,
  ChevronLeft
} from 'lucide-react';

const navLinks = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Expenses', href: '/expenses', icon: ReceiptText },
  { name: 'Budgets', href: '/budgets', icon: PiggyBank },
  { name: 'Categories', href: '/categories', icon: Tags },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className={`w-64 h-screen sidebar flex flex-col fixed left-0 top-0 transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full shadow-none'}`}>
      <div className="p-8 flex items-center justify-between">
        <Link href="/" className="text-3xl font-serif font-bold text-accent-green tracking-tight">
          Cashually
        </Link>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-white/10 rounded-lg text-muted-foreground transition-colors"
          title="Close Sidebar"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive 
                  ? 'bg-accent-green/10 text-white border-l-4 border-accent-green' 
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/10">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-accent-green/20 flex items-center justify-center text-accent-green shrink-0">
            <User size={20} />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">{user?.name || 'Guest User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center space-x-3 text-muted-foreground hover:text-accent-red transition-colors w-full px-4 py-2"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
