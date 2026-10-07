"use client";

import React, { useState } from 'react';
import { useApp } from './AppContext';
import { 
  FileEdit, 
  Calendar, 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Send,
  Sparkles,
  PlaneTakeoff,
  ClockAlert
} from 'lucide-react';

interface RegularizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'REGULARIZATION' | 'LEAVE';
  onSubmitted?: () => void;
}

export default function RegularizationModal({
  isOpen,
  onClose,
  defaultTab = 'REGULARIZATION',
  onSubmitted
}: RegularizationModalProps) {
  const { currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'REGULARIZATION' | 'LEAVE'>(defaultTab);
  
  // Regularization fields
  const [regDate, setRegDate] = useState('2026-10-05');
  const [proposedClockIn, setProposedClockIn] = useState('09:00');
  const [proposedClockOut, setProposedClockOut] = useState('18:00');
  const [regReason, setRegReason] = useState('Forgot to clock out before leaving office premises');

  // Leave fields
  const [leaveType, setLeaveType] = useState<'CASUAL' | 'SICK' | 'PAID' | 'PRIVILEGE'>('CASUAL');
  const [leaveStartDate, setLeaveStartDate] = useState('2026-10-12');
  const [leaveEndDate, setLeaveEndDate] = useState('2026-10-13');
  const [leaveReason, setLeaveReason] = useState('');

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const payload = {
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        type: activeTab,
        date: activeTab === 'REGULARIZATION' ? regDate : leaveStartDate,
        endDate: activeTab === 'LEAVE' ? leaveEndDate : undefined,
        proposedClockIn: activeTab === 'REGULARIZATION' ? proposedClockIn : undefined,
        proposedClockOut: activeTab === 'REGULARIZATION' ? proposedClockOut : undefined,
        leaveType: activeTab === 'LEAVE' ? leaveType : undefined,
        reason: activeTab === 'REGULARIZATION' ? regReason : leaveReason,
      };

      const res = await fetch('/api/regularization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: data.message });
        if (onSubmitted) onSubmitted();
        setTimeout(() => {
          onClose();
          setStatusMessage(null);
        }, 1500);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Submission failed' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPreset = (preset: 'FORGOT_CLOCKOUT' | 'GPS_TIMEOUT' | 'CLIENT_VISIT') => {
    if (preset === 'FORGOT_CLOCKOUT') {
      setRegReason('Forgot to record clock-out location before leaving premises yesterday.');
      setProposedClockIn('09:00');
      setProposedClockOut('18:15');
    } else if (preset === 'GPS_TIMEOUT') {
      setRegReason('Hardware biometric GPS timeout upon entering office gate.');
      setProposedClockIn('08:55');
      setProposedClockOut('18:00');
    } else if (preset === 'CLIENT_VISIT') {
      setRegReason('Direct on-site client architecture workshop at Financial District.');
      setProposedClockIn('09:30');
      setProposedClockOut('19:00');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header with Switcher Tabs */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileEdit className="w-5 h-5 text-indigo-600" />
              <span>Shift Attendance & Leave Portal</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit adjustments or leaves for manager sign-off ({currentUser.managerName || 'Deepika Pillai'})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => { setActiveTab('REGULARIZATION'); setStatusMessage(null); }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'REGULARIZATION'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClockAlert className="w-3.5 h-3.5 text-indigo-600" />
              <span>Attendance Regularization</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('LEAVE'); setStatusMessage(null); }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'LEAVE'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlaneTakeoff className="w-3.5 h-3.5 text-indigo-600" />
              <span>Apply for Leave</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {activeTab === 'REGULARIZATION' ? (
            <>
              {/* Fast 1-Click Reason Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600">1-Click Common Scenarios:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('FORGOT_CLOCKOUT')}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-semibold transition-colors"
                  >
                    Forgot Clock-Out Yesterday
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('GPS_TIMEOUT')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-semibold transition-colors"
                  >
                    GPS/Biometric Timeout
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('CLIENT_VISIT')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-semibold transition-colors"
                  >
                    On-Site Client Visit
                  </button>
                </div>
              </div>

              {/* Date & Time Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Shift Date</label>
                  <input
                    type="date"
                    value={regDate}
                    onChange={(e) => setRegDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Actual Clock-In</label>
                  <input
                    type="time"
                    value={proposedClockIn}
                    onChange={(e) => setProposedClockIn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Actual Clock-Out</label>
                  <input
                    type="time"
                    value={proposedClockOut}
                    onChange={(e) => setProposedClockOut(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Justification Reason */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Reason for Regularization & Manager Verification
                </label>
                <textarea
                  rows={3}
                  value={regReason}
                  onChange={(e) => setRegReason(e.target.value)}
                  placeholder="Explain why the shift was not stamped in real-time..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  required
                />
              </div>
            </>
          ) : (
            <>
              {/* Leave Type Selector */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Leave Category</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLeaveType('CASUAL')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      leaveType === 'CASUAL'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <p className="text-xs">Casual Leave</p>
                    <p className="text-[10px] text-slate-400 font-normal">
                      {currentUser.leaveBalance?.casualLeave.remaining || 5} days left
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLeaveType('SICK')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      leaveType === 'SICK'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <p className="text-xs">Sick Leave</p>
                    <p className="text-[10px] text-slate-400 font-normal">
                      {currentUser.leaveBalance?.sickLeave.remaining || 8} days left
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLeaveType('PAID')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      leaveType === 'PAID'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <p className="text-xs">Paid Annual</p>
                    <p className="text-[10px] text-slate-400 font-normal">
                      {currentUser.leaveBalance?.annualLeave.remaining || 14} days left
                    </p>
                  </button>
                </div>
              </div>

              {/* Leave Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">End Date</label>
                  <input
                    type="date"
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Leave Reason */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Reason for Leave Request</label>
                <textarea
                  rows={3}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Provide context for planned absence..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
                  required
                />
              </div>
            </>
          )}

          {/* Feedback Status Alert */}
          {statusMessage && (
            <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {activeTab === 'REGULARIZATION'
                      ? 'Submit Regularization for Manager Approval'
                      : 'Submit Leave Application'}
                  </span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
