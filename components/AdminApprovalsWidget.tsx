"use client";

import React, { useState, useEffect } from 'react';
import { RegularizationRequest } from '@/lib/types';
import { useApp } from './AppContext';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  FileText, 
  UserCheck, 
  AlertCircle, 
  Loader2,
  ChevronRight,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';

export default function AdminApprovalsWidget() {
  const { showToast } = useApp();
  const [requests, setRequests] = useState<RegularizationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/regularization');
      const data = await res.json();
      if (data.success && Array.isArray(data.requests)) {
        setRequests(data.requests);
      }
    } catch (e) {
      console.error("Failed to fetch regularization requests", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      setActionLoadingId(id);
      const res = await fetch('/api/regularization', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status,
          managerNotes: status === 'APPROVED' ? 'Approved by Admin Deepika Pillai' : 'Rejected after audit review'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          status === 'APPROVED' ? 'Request Approved' : 'Request Rejected',
          `Updated status for ${data.request.userName}`,
          status === 'APPROVED' ? 'success' : 'error'
        );
        setRequests(prev => prev.map(r => r.id === id ? data.request : r));
      } else {
        showToast('Error', data.error || 'Failed to update request', 'error');
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Network error', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  const filtered = requests.filter(r => filter === 'ALL' ? true : r.status === filter);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Leave & Attendance Approvals
              </h3>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 animate-pulse">
                  {pendingCount} Pending
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Review and authorize employee leave requests & missed clock-in regularizations
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
          {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filter === f
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="py-8 flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Loading approval queue...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-100">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1 opacity-80" />
          <p className="text-xs font-bold text-slate-700">No {filter.toLowerCase()} requests in queue</p>
          <p className="text-[11px] text-slate-400">All submissions are currently processed and up-to-date.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((req) => {
            const isPending = req.status === 'PENDING';
            const isLeave = req.type === 'LEAVE';
            const isActionBusy = actionLoadingId === req.id;

            return (
              <div
                key={req.id}
                className={`p-4 rounded-xl border transition-all ${
                  isPending 
                    ? 'bg-white border-indigo-100 shadow-2xs hover:border-indigo-200' 
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  
                  {/* Left: Requester & Reason */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{req.userName}</span>
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {req.userId}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isLeave ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {isLeave ? `🏖️ ${req.leaveType || 'CASUAL'} LEAVE` : '⏱️ ATTENDANCE REGULARIZATION'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        Date: <strong className="text-slate-700">{req.date} {req.endDate ? `to ${req.endDate}` : ''}</strong>
                      </span>
                      {!isLeave && req.proposedClockIn && (
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          Proposed In: {req.proposedClockIn} {req.proposedClockOut ? `• Out: ${req.proposedClockOut}` : ''}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 italic bg-slate-50/80 px-2.5 py-1 rounded-lg border border-slate-100 max-w-xl">
                      "{req.reason}"
                    </p>
                  </div>

                  {/* Right: Actions or Status */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => handleAction(req.id, 'APPROVED')}
                          disabled={isActionBusy}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isActionBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleAction(req.id, 'REJECTED')}
                          disabled={isActionBusy}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold border ${
                        req.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {req.status === 'APPROVED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{req.status}</span>
                      </span>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
