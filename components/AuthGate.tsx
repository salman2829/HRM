"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from './AppContext';
import { UserRole } from '@/lib/types';
import BrandLogo from './BrandLogo';
import { 
  Shield, 
  User as UserIcon, 
  GraduationCap, 
  Lock, 
  LogIn, 
  AlertCircle, 
  Eye, 
  EyeOff,
  ChevronDown
} from 'lucide-react';

interface AuthGateProps {
  initialRole?: UserRole;
  targetPath?: string;
  title?: string;
  subtitle?: string;
}

export default function AuthGate({ 
  initialRole = 'ADMIN', 
  targetPath,
  title = "WorkPulse Authentication",
  subtitle = "Choose your role and enter your credentials to access your dedicated portal."
}: AuthGateProps) {
  const { login, users, setRole } = useApp();
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [identifier, setIdentifier] = useState(
    initialRole === 'ADMIN' ? 'deepika.p' : initialRole === 'EMPLOYEE' ? 'aarav.sharma' : 'diya.c'
  );
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showQuickList, setShowQuickList] = useState(false);

  // Filter users by selected role for quick selection
  const roleUsers = users.filter(u => u.role === selectedRole);

  const handleRoleTabClick = (r: UserRole) => {
    setSelectedRole(r);
    setErrorMsg(null);
    setPassword('');
    if (r === 'ADMIN') {
      setIdentifier('deepika.p');
    } else if (r === 'EMPLOYEE') {
      setIdentifier('aarav.sharma');
    } else {
      setIdentifier('diya.c');
    }
  };

  const handleSelectPreFill = (u: any) => {
    setIdentifier(u.username || u.email);
    setPassword('');
    setErrorMsg(null);
    setShowQuickList(false);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Please enter your username, email, or employee code.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await login(identifier.trim(), password.trim());

      if (res.success && res.user) {
        setRole(res.user.role);
        if (targetPath) {
          router.push(targetPath);
        } else if (res.user.role === 'ADMIN') {
          router.push('/admin');
        } else if (res.user.role === 'EMPLOYEE') {
          router.push('/employee');
        } else if (res.user.role === 'INTERN') {
          router.push('/intern');
        }
      } else {
        setErrorMsg(res.message || 'Authentication failed. Please check your username and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 transition-colors font-sans">
      
      {/* Header with Brand Logo */}
      <div className="flex flex-col items-center text-center space-y-2">
        <BrandLogo size="lg" showBadge={true} />
        <h2 className="text-lg font-bold text-slate-900 tracking-tight font-heading mt-2">
          {title}
        </h2>
        <p className="text-xs text-slate-500">
          {subtitle}
        </p>
      </div>

      {/* Role Switcher Tabs */}
      <div className="space-y-1.5">
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          
          <button
            type="button"
            onClick={() => handleRoleTabClick('ADMIN')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              selectedRole === 'ADMIN'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>Admin</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleTabClick('EMPLOYEE')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              selectedRole === 'EMPLOYEE'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>Employee</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleTabClick('INTERN')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              selectedRole === 'INTERN'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            <span>Intern</span>
          </button>

        </div>
      </div>

      {/* Username and Password Form */}
      <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            Username / Email
          </label>
          <div className="relative">
            <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. deepika.p or deepika.p@workpulse.io"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-9 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In to {selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()} Portal</span>
            </>
          )}
        </button>
      </form>

      {/* Quick Select Profile Accordion (Without exposing passwords) */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowQuickList(!showQuickList)}
          className="w-full flex items-center justify-between text-[11px] text-slate-500 hover:text-slate-800 transition-colors py-1 cursor-pointer"
        >
          <span>Select Sample Account ({selectedRole})</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showQuickList ? 'rotate-180' : ''}`} />
        </button>

        {showQuickList && (
          <div className="grid grid-cols-1 gap-1.5 mt-2 max-h-40 overflow-y-auto pr-1">
            {roleUsers.slice(0, 5).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleSelectPreFill(u)}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-left transition-colors flex items-center gap-2.5 cursor-pointer"
              >
                <img src={u.avatarUrl} className="w-6 h-6 rounded-md object-cover flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 truncate">{u.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{u.jobTitle}</p>
                </div>
                <span className="text-[10px] text-indigo-600 font-mono">fill</span>
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
