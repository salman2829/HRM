"use client";

import React, { useState } from 'react';
import { useApp } from '@/components/AppContext';
import AttendanceWidget from '@/components/AttendanceWidget';
import EmployeeProfileCard from '@/components/EmployeeProfileCard';
import AttendanceHistoryTable from '@/components/AttendanceHistoryTable';
import MapWrapper from '@/components/MapWrapper';
import AuthGate from '@/components/AuthGate';
import AutoClockOutAlert from '@/components/AutoClockOutAlert';
import MonthlyAttendanceCalendar from '@/components/MonthlyAttendanceCalendar';
import RegularizationSection from '@/components/RegularizationSection';
import RegularizationModal from '@/components/RegularizationModal';
import { User as UserIcon, Calendar, MapPin, CheckCircle2 } from 'lucide-react';

export default function EmployeePortalPage() {
  const { currentUser, attendanceHistory } = useApp();
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  if (!currentUser) {
    return (
      <div className="py-8 animate-in fade-in duration-300">
        <AuthGate
          initialRole="EMPLOYEE"
          title="Employee Portal Authentication"
          subtitle="Please select your role and enter your credentials (e.g. aarav.sharma / aarav) to enter your self-service workspace."
          targetPath="/employee"
        />
      </div>
    );
  }

  const userRecords = attendanceHistory.filter(r => r.userId === currentUser.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      
      {/* Auto Clock-Out Reminder / Idle Alert */}
      <AutoClockOutAlert />

      {/* Top Banner Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <UserIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Employee Self-Service Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white tracking-tight mt-0.5">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {currentUser.jobTitle} • {currentUser.department} • Manager: {currentUser.managerName || "Deepika Pillai"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 flex items-center gap-2 font-semibold shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </span>
        </div>
      </div>

      {/* Hero Shift Card (Left 7 cols) & Profile / Asset Allocation Card (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <AttendanceWidget />
        </div>

        <div className="lg:col-span-5">
          <EmployeeProfileCard 
            user={currentUser} 
            onApplyLeaveClick={() => setShowLeaveModal(true)}
          />
        </div>
      </div>

      {/* Monthly Attendance & Punctuality Analytics Mini-Calendar */}
      <MonthlyAttendanceCalendar userId={currentUser.id} />

      {/* 1-Click Leave & Regularization Requests Section */}
      <RegularizationSection />

      {/* Geolocation Visualizer for Shift Point */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Shift Location Verification Point</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentUser.status === 'CLOCKED_IN'
                ? 'Active live check-in coordinate verified on corporate radar'
                : 'Privacy Protected: Location is hidden when off-duty / clocked-out'}
            </p>
          </div>

          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            currentUser.status === 'CLOCKED_IN'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {currentUser.status === 'CLOCKED_IN' ? '🟢 Live GPS Active' : '⚪ Shift Offline'}
          </span>
        </div>

        <MapWrapper
          users={[currentUser]}
          selectedUser={currentUser}
          height="280px"
        />
      </div>

      {/* Recent Personal Shift History Table */}
      <div id="history">
        <AttendanceHistoryTable
          records={userRecords}
          title="Recent Personal Shift Logs"
          subtitle={`Chronological clock-in and clock-out timestamps for ${currentUser.name}`}
        />
      </div>

      {/* Leave Application Modal */}
      <RegularizationModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        defaultTab="LEAVE"
      />

    </div>
  );
}
