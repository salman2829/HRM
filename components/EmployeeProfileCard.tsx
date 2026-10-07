"use client";

import React, { useState } from 'react';
import { User } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { 
  Mail, 
  Phone, 
  Calendar, 
  Laptop, 
  Monitor, 
  CreditCard, 
  Building, 
  Headphones, 
  CheckCircle2, 
  ShieldCheck,
  UserCheck,
  PlaneTakeoff,
  Award,
  Layers,
  HeartHandshake,
  KeyRound
} from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

interface EmployeeProfileCardProps {
  user: User;
  onApplyLeaveClick?: () => void;
}

export default function EmployeeProfileCard({ user, onApplyLeaveClick }: EmployeeProfileCardProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ASSETS' | 'LEAVES'>('OVERVIEW');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const isClockedIn = user.status === 'CLOCKED_IN';

  const assets = user.assets || {
    laptopSerial: `MBP-M3-${user.id}-2025`,
    monitorModel: 'Dell UltraSharp 27" 4K USB-C Hub',
    accessCardId: `WP-RFID-${user.id.replace('-', '')}`,
    workstationDesk: `Cyberabad Tower 3, Floor 4, Bay ${user.id.replace('EMP-', 'E')}`,
    headset: 'Jabra Evolve2 65 Bluetooth',
    allocatedDate: '2025-06-01'
  };

  const leaveBalance = user.leaveBalance || {
    annualLeave: { total: 18, used: 4, remaining: 14 },
    sickLeave: { total: 10, used: 2, remaining: 8 },
    casualLeave: { total: 7, used: 2, remaining: 5 }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5 font-sans">
      
      {/* Profile Header */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-14 h-14 rounded-2xl object-cover ring-1 ring-slate-200 shadow-xs bg-slate-100"
            />
            <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
              isClockedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`}></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 leading-tight">{user.name}</h3>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                user.role === 'INTERN' ? 'bg-amber-100 text-amber-800' :
                'bg-indigo-100 text-indigo-700'
              }`}>
                {user.role}
              </span>
            </div>
            <p className="text-xs text-indigo-600 font-semibold">{user.jobTitle}</p>
            <p className="text-[11px] text-slate-500">{user.department} • <span className="font-mono">{user.employeeCode || user.id}</span></p>
          </div>
        </div>

        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
          isClockedIn 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}>
          {isClockedIn ? 'Active On-Shift' : 'Off-Duty'}
        </span>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('OVERVIEW')}
          className={`py-1.5 rounded-lg transition-all ${
            activeTab === 'OVERVIEW' 
              ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Profile Details
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ASSETS')}
          className={`py-1.5 rounded-lg transition-all ${
            activeTab === 'ASSETS' 
              ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Digital Assets
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('LEAVES')}
          className={`py-1.5 rounded-lg transition-all ${
            activeTab === 'LEAVES' 
              ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Leave Balances
        </button>
      </div>

      {/* Tab 1: Profile Details */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-semibold block">Email Address:</span>
              <p className="font-bold text-slate-900 truncate select-all">{user.email}</p>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-semibold block">Contact Number:</span>
              <p className="font-bold text-slate-900">{user.phone}</p>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-semibold block">Reporting Manager:</span>
              <p className="font-bold text-slate-900">{user.managerName || "Deepika Pillai (Chief Operations Admin)"}</p>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-semibold block">Emergency Contact:</span>
              <p className="font-bold text-slate-900">
                {user.emergencyContact?.name || "Immediate Family"} ({user.emergencyContact?.phone || "+91 98450 12345"})
              </p>
            </div>
          </div>

          {/* Core Competencies */}
          {user.skills && user.skills.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-indigo-600" /> Core Competencies
              </span>
              <div className="flex flex-wrap gap-1.5">
                {user.skills.map((skill, i) => (
                  <span key={i} className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Change Password Shortcut Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
              <span>Update Account Password</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Hardware Asset Allocation */}
      {activeTab === 'ASSETS' && (
        <div className="space-y-3 animate-in fade-in duration-150 text-xs">
          <div className="bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-900">Assigned Corporate Assets</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Verified & Active
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                  <Laptop className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-900">Primary Laptop</p>
                  <p className="text-[10px] text-slate-500 font-mono">{assets.laptopSerial}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600">Issued</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                  <Monitor className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-900">External Display</p>
                  <p className="text-[10px] text-slate-500">{assets.monitorModel}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600">Issued</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-900">RFID Access Badge</p>
                  <p className="text-[10px] text-slate-500 font-mono">{assets.accessCardId}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600">Active</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                  <Building className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-900">Assigned Workstation Desk</p>
                  <p className="text-[10px] text-slate-500">{assets.workstationDesk}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-600">Floor 4</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Leave Balance Tracker */}
      {activeTab === 'LEAVES' && (
        <div className="space-y-3 animate-in fade-in duration-150 text-xs">
          
          {/* Annual Leave */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Paid Annual Leave</span>
              <span className="text-[11px] font-bold text-indigo-700">
                {leaveBalance.annualLeave.remaining} of {leaveBalance.annualLeave.total} Days Left
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full"
                style={{ width: `${(leaveBalance.annualLeave.remaining / leaveBalance.annualLeave.total) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Sick Leave */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Sick & Medical Leave</span>
              <span className="text-[11px] font-bold text-emerald-700">
                {leaveBalance.sickLeave.remaining} of {leaveBalance.sickLeave.total} Days Left
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${(leaveBalance.sickLeave.remaining / leaveBalance.sickLeave.total) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Casual Leave */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Casual Leave</span>
              <span className="text-[11px] font-bold text-amber-700">
                {leaveBalance.casualLeave.remaining} of {leaveBalance.casualLeave.total} Days Left
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${(leaveBalance.casualLeave.remaining / leaveBalance.casualLeave.total) * 100}%` }}
              ></div>
            </div>
          </div>

          {onApplyLeaveClick && (
            <button
              onClick={onApplyLeaveClick}
              className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <PlaneTakeoff className="w-3.5 h-3.5" />
              <span>Apply for Leave</span>
            </button>
          )}

        </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

    </div>
  );
}
