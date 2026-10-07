"use client";

import React, { useState, useMemo } from 'react';
import { RAW_STAFF_DATA } from '@/lib/mock-data';
import { 
  X, 
  Search, 
  Copy, 
  Check, 
  KeyRound, 
  ArrowRight,
  Shield,
  User as UserIcon,
  GraduationCap
} from 'lucide-react';

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser?: (username: string, role: string, pass: string) => void;
}

export default function CredentialsModal({ isOpen, onClose, onSelectUser }: CredentialsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'ALL' | 'ADMIN' | 'EMPLOYEE' | 'INTERN'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Compute standard passwords
  const staffWithCredentials = useMemo(() => {
    return RAW_STAFF_DATA.map(staff => {
      const firstName = staff.name.split(' ')[0].toLowerCase();
      const username = staff.email.split('@')[0];
      return {
        ...staff,
        username,
        primaryPassword: firstName,
        secondaryPassword: 'Pass@123',
      };
    });
  }, []);

  const filteredStaff = useMemo(() => {
    return staffWithCredentials.filter(s => {
      const matchesRole = selectedRoleFilter === 'ALL' || s.role === selectedRoleFilter;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term || 
        s.name.toLowerCase().includes(term) ||
        s.id.toLowerCase().includes(term) ||
        s.username.toLowerCase().includes(term) ||
        s.department.toLowerCase().includes(term) ||
        s.jobTitle.toLowerCase().includes(term);
      return matchesRole && matchesSearch;
    });
  }, [staffWithCredentials, selectedRoleFilter, searchTerm]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-heading">
                WorkPulse Staff Credentials Directory
              </h2>
              <p className="text-xs text-slate-500">
                All 30 active accounts with login identifiers and standard system passwords
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close directory"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID, username, or dept..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors font-medium"
            />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 w-full sm:w-auto overflow-x-auto">
            {(['ALL', 'ADMIN', 'EMPLOYEE', 'INTERN'] as const).map(role => (
              <button
                key={role}
                onClick={() => setSelectedRoleFilter(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedRoleFilter === role
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {role === 'ALL' ? 'All (30)' : role === 'ADMIN' ? 'Admin (2)' : role === 'EMPLOYEE' ? 'Employees (18)' : 'Interns (10)'}
              </button>
            ))}
          </div>

        </div>

        {/* Credentials Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredStaff.map((staff) => {
              const isCopied = copiedId === staff.id;

              return (
                <div
                  key={staff.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-indigo-300 transition-all space-y-2.5 shadow-2xs group"
                >
                  {/* Top Card Line: Avatar, Name, Role Badge, ID */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <img
                        src={staff.avatarUrl}
                        alt={staff.name}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-xs font-bold text-slate-900 truncate">
                            {staff.name}
                          </h3>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                            staff.role === 'ADMIN'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : staff.role === 'EMPLOYEE'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {staff.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {staff.jobTitle} • <span className="font-mono text-[10px] text-slate-600">{staff.department}</span>
                        </p>
                      </div>
                    </div>

                    <span className="font-mono text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200 flex-shrink-0">
                      {staff.id}
                    </span>
                  </div>

                  {/* Bottom Credential Row */}
                  <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs font-mono">
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-400">User:</span>
                        <span className="text-slate-900 font-semibold select-all">{staff.username}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-400">Pass:</span>
                        <span className="text-indigo-600 font-bold select-all">{staff.primaryPassword}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(`${staff.username}:${staff.primaryPassword}`, staff.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Copy Username & Password"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      {onSelectUser && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectUser(staff.username, staff.role, staff.primaryPassword);
                            onClose();
                          }}
                          className="px-2 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center gap-1 border border-indigo-200 transition-colors cursor-pointer"
                        >
                          <span>Fill</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredStaff.length === 0 && (
            <div className="text-center py-10 space-y-2">
              <p className="text-xs text-slate-500">No staff members match the query "{searchTerm}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>
            💡 <span className="font-semibold text-slate-700">Standard Rule:</span> All accounts use their lowercase first name as password (or <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-800">Pass@123</code>).
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Directory
          </button>
        </div>

      </div>
    </div>
  );
}
