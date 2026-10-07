"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import RegularizationModal from './RegularizationModal';
import { RegularizationRequest } from '@/lib/types';
import { 
  FileEdit, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ClockAlert, 
  AlertCircle, 
  Plus, 
  PlaneTakeoff,
  ShieldCheck,
  Building2
} from 'lucide-react';

export default function RegularizationSection() {
  const { currentUser } = useApp();
  const [requests, setRequests] = useState<RegularizationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState<'REGULARIZATION' | 'LEAVE'>('REGULARIZATION');

  const fetchRequests = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/regularization?userId=${currentUser.id}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (e) {
      console.error("Failed to load requests:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUser?.id]);

  if (!currentUser) return null;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileEdit className="w-4 h-4 text-indigo-600" />
            <span>Attendance Regularization & Leave Requests</span>
          </h3>
          <p className="text-xs text-slate-500">
            Submit clock-in/out fixes for yesterday or apply for planned leaves.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setModalTab('REGULARIZATION'); setShowModal(true); }}
            className="py-1.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <ClockAlert className="w-3.5 h-3.5" />
            <span>Regularize Shift</span>
          </button>

          <button
            onClick={() => { setModalTab('LEAVE'); setShowModal(true); }}
            className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <PlaneTakeoff className="w-3.5 h-3.5" />
            <span>Apply Leave</span>
          </button>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="py-8 text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-100 space-y-2">
          <Clock className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-semibold text-slate-600">No Pending Regularization or Leave Requests</p>
          <p className="text-[11px] text-slate-400">Had a GPS timeout or forgot to clock out? Click "Regularize Shift" above.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase ${
                    req.type === 'REGULARIZATION'
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  }`}>
                    {req.type}
                  </span>

                  <span className="font-bold text-slate-900">
                    {req.type === 'REGULARIZATION' 
                      ? `Shift Date: ${req.date} (${req.proposedClockIn} - ${req.proposedClockOut})`
                      : `Leave: ${req.date} to ${req.endDate || req.date} (${req.leaveType})`}
                  </span>
                </div>

                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Reason: <span className="text-slate-800 font-medium">&quot;{req.reason}&quot;</span>
                </p>

                {req.managerNotes && (
                  <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex mt-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Manager Sign-Off: {req.managerNotes} ({req.managerName || 'Deepika Pillai'})</span>
                  </p>
                )}
              </div>

              <div className="flex-shrink-0 flex items-center gap-2 self-start sm:self-center">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                  req.status === 'APPROVED' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : req.status === 'REJECTED'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {req.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
                  {req.status === 'PENDING' && <Clock className="w-3 h-3 text-amber-600" />}
                  {req.status === 'REJECTED' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                  <span>{req.status}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <RegularizationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        defaultTab={modalTab}
        onSubmitted={fetchRequests}
      />

    </div>
  );
}
