"use client";

import React, { useState } from 'react';
import { useApp } from '@/components/AppContext';
import MetricKpiCards from '@/components/MetricKpiCards';
import StaffDirectoryTable from '@/components/StaffDirectoryTable';
import MapWrapper from '@/components/MapWrapper';
import StaffDetailModal from '@/components/StaffDetailModal';
import AttendanceHistoryTable from '@/components/AttendanceHistoryTable';
import CredentialsModal from '@/components/CredentialsModal';
import AdminApprovalsWidget from '@/components/AdminApprovalsWidget';
import AuthGate from '@/components/AuthGate';
import { User } from '@/lib/types';
import { Shield, Radio, AlertTriangle, Users, Download } from 'lucide-react';
import { exportStaffDirectoryToCsv } from '@/lib/export-utils';

export default function AdminDashboardPage() {
  const { 
    currentUser, 
    users, 
    metrics, 
    attendanceHistory, 
    filterRole,
    setFilterRole,
    filterDepartment,
    setFilterDepartment,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const [selectedUserOnMap, setSelectedUserOnMap] = useState<User | null>(null);
  const [detailModalUser, setDetailModalUser] = useState<User | null>(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);

  // Strict Authentication & Role Gate
  if (!currentUser) {
    return (
      <div className="py-8 animate-in fade-in duration-300 font-sans">
        <AuthGate
          initialRole="ADMIN"
          title="Admin Portal Access"
          subtitle="Administrative access required. Please sign in as Deepika Pillai (deepika.p / deepika) or with verified administrator credentials."
          targetPath="/admin"
        />
      </div>
    );
  }

  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto py-10 space-y-6 animate-in fade-in duration-300 font-sans">
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mx-auto shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-amber-900">Administrative Authorization Required</h2>
          <p className="text-xs text-amber-700 leading-relaxed">
            You are signed in as <strong>{currentUser.name}</strong> ({currentUser.role}). Executive workforce controls require an <strong>ADMIN</strong> account.
          </p>
        </div>

        <AuthGate
          initialRole="ADMIN"
          title="Switch to Admin Account"
          subtitle="Sign in with Deepika Pillai (deepika.p / deepika) to unlock this dashboard."
          targetPath="/admin"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      
      {/* Page Heading & Status Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>Executive Command • Admin: {currentUser.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight mt-0.5">
            Workforce Command & Geolocation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Live shift tracking, active personnel radar, and privacy-preserving audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Staff Roster CSV */}
          <button
            type="button"
            onClick={() => exportStaffDirectoryToCsv(users)}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
            title="Export full staff roster to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export Roster</span>
          </button>

          {/* Admin Exclusive Credentials Directory Button */}
          <button
            type="button"
            onClick={() => setShowCredentialsModal(true)}
            className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Staff Passwords Directory</span>
          </button>

          <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Radar Live Sync</span>
          </div>
        </div>
      </div>

      {/* Row 1: High-Value Metric Ribbon (4 Key Cards) */}
      <MetricKpiCards metrics={metrics} />

      {/* Row 2: Primary Split Workspace (Staff Directory & Map) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Filterable Staff Directory */}
        <div className="lg:col-span-5 h-[480px] lg:h-[580px]">
          <StaffDirectoryTable 
            users={users}
            selectedUser={selectedUserOnMap}
            onSelectUser={(u) => setSelectedUserOnMap(u)}
            onOpenDetailModal={(u) => setDetailModalUser(u)}
            filterRole={filterRole}
            setFilterRole={setFilterRole}
            filterDepartment={filterDepartment}
            setFilterDepartment={setFilterDepartment}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        {/* Right Side: Live Leaflet Map */}
        <div className="lg:col-span-7 h-[380px] sm:h-[460px] lg:h-[580px] flex flex-col" id="radar">
          <MapWrapper
            users={users}
            selectedUser={selectedUserOnMap}
            onSelectUser={(u) => setSelectedUserOnMap(u)}
            height="100%"
          />
        </div>

      </div>

      {/* Admin Leave & Regularization Approval Center */}
      <AdminApprovalsWidget />

      {/* Full Attendance History Audit Log Table */}
      <div id="audit">
        <AttendanceHistoryTable
          records={attendanceHistory}
          title="Shift Attendance Audit Log"
          subtitle="Chronological log of shift clock-ins, duration, and verified locations"
        />
      </div>

      {/* Staff Profile Detail Modal */}
      {detailModalUser && (
        <StaffDetailModal
          user={detailModalUser}
          onClose={() => setDetailModalUser(null)}
          recentRecords={attendanceHistory}
        />
      )}

      {/* Admin Exclusive Credentials Modal */}
      <CredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
      />

    </div>
  );
}
