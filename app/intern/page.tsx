"use client";

import React, { useState } from 'react';
import { useApp } from '@/components/AppContext';
import AttendanceWidget from '@/components/AttendanceWidget';
import EmployeeProfileCard from '@/components/EmployeeProfileCard';
import InternLogbookSection from '@/components/InternLogbookSection';
import AttendanceHistoryTable from '@/components/AttendanceHistoryTable';
import MonthlyAttendanceCalendar from '@/components/MonthlyAttendanceCalendar';
import RegularizationModal from '@/components/RegularizationModal';
import AuthGate from '@/components/AuthGate';
import { GraduationCap, Calendar } from 'lucide-react';

export default function InternPortalPage() {
  const { currentUser, attendanceHistory } = useApp();
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  if (!currentUser) {
    return (
      <div className="py-8 animate-in fade-in duration-300">
        <AuthGate
          initialRole="INTERN"
          title="Intern Portal Authentication"
          subtitle="Please select your role and enter your credentials (e.g. diya.c / diya) to access the mentorship hub and sprint logbook."
          targetPath="/intern"
        />
      </div>
    );
  }

  const userRecords = attendanceHistory.filter(r => r.userId === currentUser.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      
      {/* Top Banner Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Internship & Mentorship Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white tracking-tight mt-0.5">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {currentUser.jobTitle} • {currentUser.department} • Mentor: {currentUser.mentorName || "Aarav Sharma"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 flex items-center gap-2 font-semibold shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Cohort Sprint 2026</span>
          </span>
        </div>
      </div>

      {/* Hero Shift Card & Profile Card */}
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

      {/* Weekly Logbook & Progress Module with Mentor Card & Week Tabs */}
      <div id="logbook">
        <InternLogbookSection />
      </div>

      {/* Intern Attendance History Table */}
      <AttendanceHistoryTable
        records={userRecords}
        title="Personal Intern Shift Records"
        subtitle={`Verified clock-in and clock-out logs for ${currentUser.name}`}
      />

      {/* Leave Application Modal */}
      <RegularizationModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        defaultTab="LEAVE"
      />

    </div>
  );
}
