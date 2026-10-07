"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from './AppContext';
import ChangePasswordModal from './ChangePasswordModal';
import CredentialsModal from './CredentialsModal';
import BrandLogo from './BrandLogo';
import { 
  Shield, 
  User as UserIcon, 
  GraduationCap, 
  ChevronDown, 
  LogOut, 
  LogIn,
  KeyRound, 
  Menu, 
  X,
  LayoutDashboard,
  Clock,
  MapPin,
  FileText,
  Users
} from 'lucide-react';

export default function Navbar() {
  const { 
    currentUser, 
    setCurrentUser, 
    users, 
    logout 
  } = useApp();

  const pathname = usePathname();
  const router = useRouter();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setShowUserDropdown(false);
    setMobileMenuOpen(false);
    await logout();
    router.push('/');
  };

  const getMobileNavLinks = () => {
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
        { label: 'Employee Portal', href: '/employee', icon: Clock },
        { label: 'Shift History', href: '/employee#history', icon: FileText },
      ];
    }
    return [
      { label: 'Internship Hub', href: '/intern', icon: GraduationCap },
      { label: 'Weekly Logbook', href: '/intern#logbook', icon: FileText },
    ];
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu Toggle + Brand Link */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center">
            <BrandLogo size="md" showBadge={true} />
          </Link>
        </div>

        {/* Center: Authenticated Portal Indicator */}
        <div className="hidden sm:flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-slate-900">
                {currentUser.role === 'ADMIN' ? 'Admin Command' : 
                 currentUser.role === 'EMPLOYEE' ? 'Employee Portal' : 'Intern Hub'}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-mono text-[11px]">{currentUser.department}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Enterprise Geolocation & Workforce Platform</span>
            </div>
          )}
        </div>

        {/* Right Tools & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Staff Credentials Directory Trigger - ONLY VISIBLE TO ADMINS */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowCredentialsModal(true)}
              title="Admin Access: View All Staff IDs & Passwords"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors shadow-2xs"
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Credentials Directory</span>
            </button>
          )}

          {/* User Profile or Sign In Button */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1 pl-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="text-right hidden md:block">
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-500 capitalize font-mono">
                    {currentUser.role}
                  </p>
                </div>
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                />
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
              </button>

              {/* Profile Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <span className="mt-1 inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {currentUser.role} • {currentUser.employeeCode || currentUser.id}
                    </span>
                  </div>

                  <div className="pt-1 space-y-0.5">
                    {/* Admin only option */}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setShowCredentialsModal(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        <span>All Staff Credentials</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setShowPasswordModal(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Change Password</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <nav className="space-y-1">
            {getMobileNavLinks().map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            {isAdmin ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowCredentialsModal(true);
                }}
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Staff Passwords</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowPasswordModal(true);
                }}
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Change Password</span>
              </button>
            )}

            {currentUser && (
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Credentials Modal - Only accessible to Admin */}
      {isAdmin && (
        <CredentialsModal
          isOpen={showCredentialsModal}
          onClose={() => setShowCredentialsModal(false)}
        />
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </header>
  );
}
