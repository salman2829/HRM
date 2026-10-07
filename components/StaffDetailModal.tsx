"use client";

import React from 'react';
import { User, AttendanceRecord } from '@/lib/types';
import { formatTime, formatDate, formatDuration } from '@/lib/utils';
import { 
  X, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  BatteryMedium, 
  ShieldCheck, 
  Clock, 
  ExternalLink,
  Award
} from 'lucide-react';

interface StaffDetailModalProps {
  user: User | null;
  onClose: () => void;
  recentRecords?: AttendanceRecord[];
}

export default function StaffDetailModal({ user, onClose, recentRecords = [] }: StaffDetailModalProps) {
  if (!user) return null;

  const isClockedIn = user.status === 'CLOCKED_IN';
  const loc = isClockedIn ? user.currentLocation : user.lastKnownLocation;
  const userShifts = recentRecords.filter(r => r.userId === user.id);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in font-sans">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header background with banner */}
        <div className="h-24 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 relative p-4 flex justify-between items-start text-white">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/20">
            Staff Profile #{user.id}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Info Header */}
        <div className="px-6 pb-4 pt-0 relative -mt-10 flex-1 overflow-y-auto space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-3.5">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-18 h-18 rounded-2xl object-cover ring-4 ring-white shadow-md bg-slate-100"
              />
              <div className="mb-0.5">
                <h3 className="text-lg font-bold text-slate-900 leading-tight flex items-center gap-2">
                  {user.name}
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'INTERN' ? 'bg-amber-100 text-amber-800' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    {user.role}
                  </span>
                </h3>
                <p className="text-xs text-indigo-600 font-semibold">{user.jobTitle} • {user.department}</p>
              </div>
            </div>

            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
              isClockedIn 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isClockedIn ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
              {isClockedIn ? 'CLOCKED IN' : 'OFFLINE (Last Seen)'}
            </span>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-600" /> Joined
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1">{formatDate(user.joinedDate)}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-600" /> Shift Status
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1">
                {isClockedIn ? formatTime(user.currentShiftStart) : formatTime(user.lastClockOut)}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                <BatteryMedium className="w-3 h-3 text-emerald-600" /> Device Battery
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1 font-mono">{user.batteryLevel || 85}%</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-indigo-600" /> GPS Precision
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1 font-mono">±{loc?.accuracy || 10}m</p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Contact Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email:</span>
                <span className="font-bold text-slate-900 select-all">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Phone:</span>
                <span className="font-bold text-slate-900">{user.phone}</span>
              </div>
            </div>
          </div>

          {/* Geolocation Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                {isClockedIn ? 'Live Check-In Coordinates' : 'Last Known Location (At Clock-Out)'}
              </h4>
              {loc && (
                <a
                  href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {loc ? (
              <div className="text-xs space-y-1 text-slate-700">
                <p className="font-bold text-slate-900">{loc.address || 'Tech Corridor Central'}</p>
                <p className="font-mono text-slate-500 text-[11px]">
                  Coordinates: <span className="font-bold text-slate-800">{loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}</span> (Precision: ±{loc.accuracy || 10}m)
                </p>
                <p className="text-[11px] text-slate-500">
                  Timestamp Recorded: {formatTime(loc.recordedAt || loc.updatedAt)} ({formatDate(loc.recordedAt || loc.updatedAt)})
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No coordinates recorded for this staff member.</p>
            )}

            {!isClockedIn && (
              <div className="mt-2 p-2 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Privacy Rule:</strong> This employee is off-shift. Coordinates are frozen at clock-out time.
                </span>
              </div>
            )}
          </div>

          {/* Recent Shifts */}
          {userShifts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" /> Recent Shifts ({userShifts.length})
              </h4>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {userShifts.slice(0, 3).map((record) => (
                  <div key={record.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{formatDate(record.clockInTime)}</span>
                      <p className="text-[10px] text-slate-500">
                        {formatTime(record.clockInTime)} → {formatTime(record.clockOutTime)}
                      </p>
                    </div>
                    <span className="font-bold text-emerald-700 font-mono">{formatDuration(record.durationMinutes)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
