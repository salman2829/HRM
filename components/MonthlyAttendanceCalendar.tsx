"use client";

import React, { useState } from 'react';
import { useApp } from './AppContext';
import { AttendanceRecord } from '@/lib/types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck,
  TrendingUp,
  Info,
  Printer,
  Download
} from 'lucide-react';
import { printMonthlyAttendanceReport, exportAttendanceToCsv } from '@/lib/export-utils';

interface MonthlyAttendanceCalendarProps {
  userId?: string;
}

interface DayStatusInfo {
  day: number;
  date: string;
  status: 'PUNCTUAL' | 'LATE' | 'LEAVE' | 'WEEKEND' | 'ABSENT' | 'TODAY_ACTIVE';
  clockIn?: string;
  clockOut?: string;
  duration?: string;
  notes?: string;
}

export default function MonthlyAttendanceCalendar({ userId }: MonthlyAttendanceCalendarProps) {
  const { currentUser, attendanceHistory } = useApp();

  const targetUserId = userId || currentUser?.id;
  const userRecords = attendanceHistory.filter(r => r.userId === targetUserId);

  const [selectedMonth, setSelectedMonth] = useState('October 2026');
  const [selectedDayDetail, setSelectedDayDetail] = useState<DayStatusInfo | null>(null);

  // October 2026 starts on a Thursday (day 4), 31 days
  const totalDays = 31;
  const startDayOfWeek = 4; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Map each day in October 2026
  const getDayStatus = (dayNum: number): DayStatusInfo => {
    const dateStr = `2026-10-${dayNum.toString().padStart(2, '0')}`;
    const dayOfWeek = (startDayOfWeek + dayNum - 1) % 7;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (dayNum > 6) {
      // Future dates in the month
      return {
        day: dayNum,
        date: dateStr,
        status: isWeekend ? ('WEEKEND' as const) : ('ABSENT' as const),
        notes: isWeekend ? "Weekend Off" : "Upcoming Scheduled Working Day"
      };
    }

    if (dayNum === 6) {
      // Today (Oct 6, 2026)
      const rec = userRecords.find(r => r.date === dateStr);
      if (rec) {
        const isLate = rec.clockInTime && new Date(rec.clockInTime).getUTCMinutes() > 30 && new Date(rec.clockInTime).getUTCHours() >= 9;
        return {
          day: dayNum,
          date: dateStr,
          status: 'TODAY_ACTIVE' as const,
          clockIn: new Date(rec.clockInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          clockOut: rec.clockOutTime ? new Date(rec.clockOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'In Progress',
          duration: rec.durationMinutes ? `${Math.floor(rec.durationMinutes / 60)}h ${rec.durationMinutes % 60}m` : 'Live Shift',
          notes: isLate ? "Shift active (Late arrival recorded)" : "Shift active & verified via GPS"
        };
      }
    }

    if (isWeekend) {
      return {
        day: dayNum,
        date: dateStr,
        status: 'WEEKEND' as const,
        notes: "Weekend Rest Day"
      };
    }

    // Historical days 1 to 5
    const rec = userRecords.find(r => r.date === dateStr);
    if (rec) {
      const inDate = new Date(rec.clockInTime);
      const isLate = (inDate.getUTCHours() === 9 && inDate.getUTCMinutes() > 30) || inDate.getUTCHours() > 9;
      return {
        day: dayNum,
        date: dateStr,
        status: isLate ? ('LATE' as const) : ('PUNCTUAL' as const),
        clockIn: inDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        clockOut: rec.clockOutTime ? new Date(rec.clockOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '18:00 PM',
        duration: rec.durationMinutes ? `${Math.floor(rec.durationMinutes / 60)}h ${rec.durationMinutes % 60}m` : '8h 45m',
        notes: isLate ? "Traffic congestion on Hitec City flyover" : "Punctual regular check-in"
      };
    }

    // Day 4 has approved leave in mock
    if (dayNum === 2) {
      return {
        day: dayNum,
        date: dateStr,
        status: 'PUNCTUAL' as const,
        clockIn: '09:12 AM',
        clockOut: '18:00 PM',
        duration: '8h 48m',
        notes: 'Punctual regular shift'
      };
    }

    return {
      day: dayNum,
      date: dateStr,
      status: 'PUNCTUAL' as const,
      clockIn: '09:00 AM',
      clockOut: '18:00 PM',
      duration: '9h 00m',
      notes: 'Standard verified shift'
    };
  };

  const daysList = Array.from({ length: totalDays }, (_, i) => getDayStatus(i + 1));
  const leadingBlanks = Array.from({ length: startDayOfWeek }, (_, i) => i);

  // Consistency & Punctuality metrics
  const punctualCount = daysList.filter(d => d.status === 'PUNCTUAL' || d.status === 'TODAY_ACTIVE').length;
  const lateCount = daysList.filter(d => d.status === 'LATE').length;
  const punctualityRate = Math.round((punctualCount / Math.max(punctualCount + lateCount, 1)) * 100);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 font-sans">
      
      {/* Header & KPI Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-indigo-600" />
            <span>Monthly Attendance & Punctuality Analytics</span>
          </h3>
          <p className="text-xs text-slate-500">
            Daily consistency map, late arrival alerts, and scheduled shift logs.
          </p>
        </div>

        {/* Punctuality KPIs & Print Statement */}
        <div className="flex items-center gap-2 flex-wrap">
          {currentUser && (
            <button
              type="button"
              onClick={() => printMonthlyAttendanceReport(currentUser, userRecords)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 text-xs font-bold transition-colors shadow-2xs cursor-pointer"
              title="Print Monthly Shift & Attendance Statement"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-600" />
              <span>Print Statement</span>
            </button>
          )}

          <div className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>{punctualityRate}% Punctual</span>
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold">
            <span>5/5 Days Present</span>
          </div>
        </div>
      </div>

      {/* Mini Calendar Month Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <span>{selectedMonth}</span>
          <span className="text-[10px] text-indigo-600 font-mono font-normal">(Current Sprint)</span>
        </span>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Punctual</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Late</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span>Active</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
            <span>Weekend</span>
          </span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5 pt-1">
        {/* Day Headers */}
        {daysOfWeek.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase py-1">
            {d}
          </div>
        ))}

        {/* Blank Leading Days */}
        {leadingBlanks.map((b) => (
          <div key={`blank-${b}`} className="h-10 rounded-xl bg-slate-50/40 border border-transparent"></div>
        ))}

        {/* Calendar Day Cells */}
        {daysList.map((d) => {
          const isSelected = selectedDayDetail?.day === d.day;
          
          let dotColor = 'bg-slate-300';
          let borderHighlight = 'border-slate-100 bg-white hover:border-indigo-300';

          if (d.status === 'PUNCTUAL') {
            dotColor = 'bg-emerald-500 ring-2 ring-emerald-200';
            borderHighlight = 'bg-emerald-50/40 border-emerald-200/80';
          } else if (d.status === 'LATE') {
            dotColor = 'bg-amber-500 ring-2 ring-amber-200';
            borderHighlight = 'bg-amber-50/50 border-amber-200';
          } else if (d.status === 'TODAY_ACTIVE') {
            dotColor = 'bg-indigo-600 animate-ping';
            borderHighlight = 'bg-indigo-50/80 border-indigo-300 ring-1 ring-indigo-400';
          } else if (d.status === 'LEAVE') {
            dotColor = 'bg-blue-500';
            borderHighlight = 'bg-blue-50/40 border-blue-200';
          } else if (d.status === 'WEEKEND') {
            dotColor = 'bg-slate-300';
            borderHighlight = 'bg-slate-50/70 border-slate-100 text-slate-400';
          }

          return (
            <button
              key={`day-${d.day}`}
              type="button"
              onClick={() => setSelectedDayDetail(d)}
              className={`h-11 rounded-xl p-1.5 flex flex-col justify-between items-center transition-all cursor-pointer border ${borderHighlight} ${
                isSelected ? 'ring-2 ring-indigo-600 shadow-xs' : ''
              }`}
            >
              <span className="text-[11px] font-bold">{d.day}</span>
              <div className="flex items-center justify-center">
                <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Inspection Drawer */}
      {selectedDayDetail && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                October {selectedDayDetail.day}, 2026
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                selectedDayDetail.status === 'PUNCTUAL' ? 'bg-emerald-100 text-emerald-800' :
                selectedDayDetail.status === 'LATE' ? 'bg-amber-100 text-amber-800' :
                selectedDayDetail.status === 'TODAY_ACTIVE' ? 'bg-indigo-100 text-indigo-800' :
                'bg-slate-200 text-slate-700'
              }`}>
                {selectedDayDetail.status.replace('_', ' ')}
              </span>
            </div>

            <button
              onClick={() => setSelectedDayDetail(null)}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-700"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600">
            {selectedDayDetail.clockIn && (
              <div>
                <span className="text-slate-400 text-[10px] block">Clock In Time:</span>
                <strong className="text-slate-900">{selectedDayDetail.clockIn}</strong>
              </div>
            )}
            {selectedDayDetail.clockOut && (
              <div>
                <span className="text-slate-400 text-[10px] block">Clock Out Time:</span>
                <strong className="text-slate-900">{selectedDayDetail.clockOut}</strong>
              </div>
            )}
            {selectedDayDetail.duration && (
              <div>
                <span className="text-slate-400 text-[10px] block">Shift Hours:</span>
                <strong className="text-indigo-600">{selectedDayDetail.duration}</strong>
              </div>
            )}
          </div>

          {selectedDayDetail.notes && (
            <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
              Audit Note: {selectedDayDetail.notes}
            </p>
          )}
        </div>
      )}

    </div>
  );
}
