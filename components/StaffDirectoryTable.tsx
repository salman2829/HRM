"use client";

import React from 'react';
import { User } from '@/lib/types';
import { formatTime } from '@/lib/utils';
import { useApp } from './AppContext';
import { 
  Search, 
  MapPin, 
  ChevronRight, 
  Users,
  Building2,
  Clock,
  Sparkles,
  Inbox
} from 'lucide-react';

interface StaffDirectoryTableProps {
  users: User[];
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
  onOpenDetailModal: (user: User) => void;
  filterRole: string;
  setFilterRole: (r: string) => void;
  filterDepartment: string;
  setFilterDepartment: (d: string) => void;
  filterStatus: string;
  setFilterStatus: (s: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export default function StaffDirectoryTable({
  users,
  selectedUser,
  onSelectUser,
  onOpenDetailModal,
  filterRole,
  setFilterRole,
  filterDepartment,
  setFilterDepartment,
  filterStatus,
  setFilterStatus,
  searchQuery,
  setSearchQuery,
}: StaffDirectoryTableProps) {
  const { hoveredUserId, setHoveredUserId, loading } = useApp();
  const departments = Array.from(new Set(users.map(u => u.department))).filter(Boolean);

  const filteredUsers = users.filter(user => {
    if (filterRole === 'EMPLOYEE' && user.role !== 'EMPLOYEE') return false;
    if (filterRole === 'INTERN' && user.role !== 'INTERN') return false;
    if (filterRole === 'ADMIN' && user.role !== 'ADMIN') return false;
    if (filterDepartment !== 'ALL' && user.department !== filterDepartment) return false;
    if (filterStatus !== 'ALL' && user.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = user.name.toLowerCase().includes(q);
      const matchEmail = user.email.toLowerCase().includes(q);
      const matchTitle = user.jobTitle.toLowerCase().includes(q);
      const matchDept = user.department.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchTitle && !matchDept) return false;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col h-full space-y-4">
      
      {/* Header with Title and Counter */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Staff Directory</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono">
              {filteredUsers.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500">Live roster synced with GPS radar</p>
        </div>
      </div>

      {/* Role Filter Pills (All | Employees | Interns) */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setFilterRole('ALL')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
            filterRole === 'ALL'
              ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({users.length})
        </button>
        <button
          onClick={() => setFilterRole('EMPLOYEE')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
            filterRole === 'EMPLOYEE'
              ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Employees ({users.filter(u => u.role === 'EMPLOYEE').length})
        </button>
        <button
          onClick={() => setFilterRole('INTERN')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
            filterRole === 'INTERN'
              ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Interns ({users.filter(u => u.role === 'INTERN').length})
        </button>
      </div>

      {/* Quick Search and Department/Status Dropdowns */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search staff by name, role, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
          />
        </div>

        {/* Filter Dropdowns for Department & Status */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white truncate"
          >
            <option value="ALL">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-indigo-600 focus:bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="CLOCKED_IN">On Duty (Clocked In)</option>
            <option value="CLOCKED_OUT">Off Duty (Clocked Out)</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>
        </div>
      </div>

      {/* Compact Staff Cards List with Bi-directional Hover Sync */}
      <div className="flex-1 overflow-y-auto max-h-[440px] space-y-2 pr-1 custom-scrollbar">
        {loading ? (
          <div className="space-y-2.5 py-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-3 rounded-xl border border-slate-200 bg-white animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                </div>
                <div className="w-14 h-5 bg-slate-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Inbox className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-600">No staff found matching filters</p>
            <p className="text-[11px] text-slate-400 max-w-[200px]">Try clearing your search keyword or switching the role tab.</p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isClockedIn = user.status === 'CLOCKED_IN';
            const loc = isClockedIn ? user.currentLocation : user.lastKnownLocation;
            const isSelected = selectedUser?.id === user.id;
            const isHovered = hoveredUserId === user.id;

            return (
              <div
                key={user.id}
                onClick={() => onSelectUser(user)}
                onMouseEnter={() => setHoveredUserId(user.id)}
                onMouseLeave={() => setHoveredUserId(null)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                    : isHovered
                    ? 'bg-slate-50 border-indigo-200 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                {/* Photo & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 bg-slate-100"
                    />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                      isClockedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    }`}></span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-xs text-slate-900 truncate">{user.name}</p>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        user.role === 'INTERN' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {user.role}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate font-medium">{user.jobTitle}</p>
                    
                    {/* Location or Timing summary */}
                    <div className="flex items-center gap-1 text-[10px] mt-0.5 truncate">
                      {isClockedIn ? (
                        <>
                          <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                          <span className="truncate text-slate-700 font-medium">
                            {user.currentLocation?.address ? user.currentLocation.address.split(',')[0] : 'Office Hub'}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="font-mono text-emerald-700 font-semibold">
                            In: {formatTime(user.currentShiftStart)}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-slate-400">🔒</span>
                          <span className="text-slate-500 font-medium truncate">
                            Location Hidden (Off Duty)
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="font-mono text-slate-500">
                            Out: {formatTime(user.lastClockOut)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Pill & Detail trigger */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                    isClockedIn 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isClockedIn ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
                    {isClockedIn ? 'Active' : 'Offline'}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDetailModal(user);
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 transition-colors"
                    title="View Profile Details"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
