"use client";

import React, { useState } from 'react';
import { AttendanceRecord } from '@/lib/types';
import { formatTime, formatDate, formatDuration } from '@/lib/utils';
import { Calendar, Clock, MapPin, Search, Smartphone } from 'lucide-react';

interface AttendanceHistoryTableProps {
  records: AttendanceRecord[];
  title?: string;
  subtitle?: string;
}

export default function AttendanceHistoryTable({
  records,
  title = "Shift Attendance History",
  subtitle = "Historical shift logs and geolocation check-in/out records"
}: AttendanceHistoryTableProps) {
  const [filterText, setFilterText] = useState('');

  const filtered = records.filter(r => 
    r.userName?.toLowerCase().includes(filterText.toLowerCase()) ||
    r.department?.toLowerCase().includes(filterText.toLowerCase()) ||
    r.date?.includes(filterText) ||
    r.clockInCoords?.address?.toLowerCase().includes(filterText.toLowerCase()) ||
    r.notes?.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search date, place, note..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Shift Duration</th>
              <th className="py-3 px-4">Clock-In Time</th>
              <th className="py-3 px-4">Clock-Out Time</th>
              <th className="py-3 px-4">Recorded Location</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                  No attendance shift records found matching the filter.
                </td>
              </tr>
            ) : (
              filtered.map((record) => {
                const isActive = !record.clockOutTime;
                return (
                  <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Date */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{formatDate(record.clockInTime)}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal">
                        {record.userName} ({record.department})
                      </p>
                    </td>

                    {/* Shift Duration */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {isActive ? (
                        <span className="text-indigo-600 font-semibold">In Progress</span>
                      ) : (
                        <span className="text-emerald-600">{formatDuration(record.durationMinutes)}</span>
                      )}
                    </td>

                    {/* Clock-In Time */}
                    <td className="py-3.5 px-4 font-mono text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{formatTime(record.clockInTime)}</span>
                      </div>
                    </td>

                    {/* Clock-Out Time */}
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {isActive ? (
                        <span className="text-slate-400">--:--</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatTime(record.clockOutTime)}</span>
                        </div>
                      )}
                    </td>

                    {/* Recorded Location */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="flex items-center gap-1 text-slate-800 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate" title={record.clockInCoords.address || ''}>
                          {record.clockInCoords.address ? record.clockInCoords.address.split(',')[0] : `${record.clockInCoords.lat.toFixed(4)}, ${record.clockInCoords.lng.toFixed(4)}`}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        ±{record.clockInCoords.accuracy || 10}m precision
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Active In Shift
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          Completed
                        </span>
                      )}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
