"use client";

import React from 'react';
import { MetricStats } from '@/lib/types';
import { Users, UserCheck, GraduationCap, Clock, TrendingUp, ShieldCheck } from 'lucide-react';

interface MetricKpiCardsProps {
  metrics: MetricStats | null;
  onSeedClick?: () => void;
  seeding?: boolean;
}

export default function MetricKpiCards({ metrics }: MetricKpiCardsProps) {
  if (!metrics) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 shadow-xs"></div>
        ))}
      </div>
    );
  }

  const attendanceRate = metrics.totalWorkforce > 0 
    ? Math.round((metrics.clockedInCount / metrics.totalWorkforce) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      {/* 4 Key Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Workforce */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Workforce</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{metrics.totalWorkforce}</span>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3" />
              Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Full-time staff & interns</p>
        </div>

        {/* Card 2: Currently Clocked In */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Currently Clocked In
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{metrics.clockedInCount}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {attendanceRate}% active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Live active geolocation signals</p>
        </div>

        {/* Card 3: Active Interns */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Interns</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{metrics.activeInternsCount}</span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              Paired
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Assigned senior mentors</p>
        </div>

        {/* Card 4: Off Duty */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Off Duty / Clocked Out</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-700 tracking-tight">{metrics.totalWorkforce - metrics.clockedInCount}</span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Protected
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Location hidden while off duty</p>
        </div>

      </div>

      {/* Department Breakdown Pill Ribbon */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2 text-xs shadow-xs">
        <span className="text-slate-500 font-semibold mr-1">Departments:</span>
        {Object.entries(metrics.departmentBreakdown).map(([dept, count]) => (
          <span key={dept} className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 font-medium">
            {dept}: <strong className="text-slate-900 font-bold">{count}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}
