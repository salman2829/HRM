"use client";

import React from 'react';
import { useApp } from './AppContext';
import { Sparkles, RotateCcw, UserPlus, LogOut, Database, Layers } from 'lucide-react';

export default function SeederToolbar() {
  const { addStaff, resetDatabase, simulateClockOuts, seeding, users, metrics } = useApp();

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      
      {/* Title & Stats */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
          <Database className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-900">Synthetic Data Seeder & Simulation Controls</h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono">
              {users.length} Active Records
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Generate randomized Indian employee profiles, realistic coordinates, and pre-calculated shift logs.
          </p>
        </div>
      </div>

      {/* Preset Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        
        {/* Preset 1: Add 10 Staff */}
        <button
          onClick={() => addStaff(10)}
          disabled={seeding}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 transition-all disabled:opacity-50"
        >
          <UserPlus className={`w-3.5 h-3.5 text-indigo-600 ${seeding ? 'animate-spin' : ''}`} />
          <span>+10 Random Staff</span>
        </button>

        {/* Preset 2: Simulate 5 Clock-Outs */}
        <button
          onClick={() => simulateClockOuts(5)}
          disabled={seeding}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 transition-all disabled:opacity-50"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-500" />
          <span>Simulate 5 Clock-outs</span>
        </button>

        {/* Preset 3: Reset Demo Database */}
        <button
          onClick={() => resetDatabase()}
          disabled={seeding}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-indigo-600 ${seeding ? 'animate-spin' : ''}`} />
          <span>Reset Demo DB</span>
        </button>

      </div>

    </div>
  );
}
