"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from './AppContext';
import BrandLogo from './BrandLogo';
import CredentialsModal from './CredentialsModal';
import { 
  LayoutDashboard, 
  MapPin, 
  Users, 
  Clock, 
  GraduationCap, 
  LogOut, 
  LogIn, 
  FileText
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useApp();
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  // Role-appropriate navigation items
  const getNavItems = () => {
    if (!currentUser) {
      return [
        { label: 'Portal Sign In', href: '/', icon: LogIn }
      ];
    }

    if (currentUser.role === 'ADMIN') {
      return [
        { label: 'Admin Command', href: '/admin', icon: LayoutDashboard },
        { label: 'Staff Radar', href: '/admin#radar', icon: MapPin },
        { label: 'Shift Audit Trail', href: '/admin#audit', icon: FileText },
      ];
    }

    if (currentUser.role === 'EMPLOYEE') {
      return [
        { label: 'Shift Terminal', href: '/employee', icon: Clock },
        { label: 'My Shift History', href: '/employee#history', icon: FileText },
      ];
    }

    // INTERN
    return [
      { label: 'Mentorship Hub', href: '/intern', icon: GraduationCap },
      { label: 'Sprint Logbook', href: '/intern#logbook', icon: FileText },
    ];
  };

  // Do not render sidebar on login page or when logged out
  if (!currentUser || pathname === '/' || pathname === '/login') {
    return null;
  }

  const navItems = getNavItems();

  return (
    <>
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800 h-screen sticky top-0 z-40 hidden md:flex font-sans">
        
        {/* Brand Header */}
        <div className="h-16 flex items-center px-4 border-b border-slate-800">
          <Link href="/">
            <BrandLogo size="md" variant="light" showBadge={true} />
          </Link>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 py-5 px-3 space-y-5 overflow-y-auto">
          <div>
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Workspace
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href === '/' && pathname === '/login');

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Admin Exclusive: Staff Credentials Directory Access */}
          {isAdmin && (
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Administrative Control
              </p>
              <button
                type="button"
                onClick={() => setShowCredentialsModal(true)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
              >
                <Users className="w-4 h-4 text-indigo-400" />
                <span>All Staff Passwords</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Profile / Auth State */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          {currentUser ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700 flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 truncate capitalize">{currentUser.role}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/"
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>

      </aside>

      {isAdmin && (
        <CredentialsModal
          isOpen={showCredentialsModal}
          onClose={() => setShowCredentialsModal(false)}
        />
      )}
    </>
  );
}
