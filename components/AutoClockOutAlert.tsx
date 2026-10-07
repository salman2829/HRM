"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { formatElapsedSeconds } from '@/lib/utils';
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  X, 
  CheckCircle2, 
  BellRing,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export default function AutoClockOutAlert() {
  const { currentUser, clockOut, liveElapsedSeconds } = useApp();
  const [dismissed, setDismissed] = useState(false);
  const [simulatedOvertime, setSimulatedOvertime] = useState(false);
  const [clockingOut, setClockingOut] = useState(false);
  const [showNotificationGranted, setShowNotificationGranted] = useState(false);

  // Check if shift is > 9 hours (32400 seconds) or simulated
  const isClockedIn = currentUser?.status === 'CLOCKED_IN';
  const effectiveSeconds = simulatedOvertime ? 34200 : liveElapsedSeconds; // 9.5 hours if simulated
  const isOvertime = isClockedIn && effectiveSeconds >= 32400; // 9 hours threshold

  useEffect(() => {
    // Request browser notification permission if available
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            setShowNotificationGranted(true);
          }
        });
      }
    }
  }, []);

  // Trigger browser push notification when overtime threshold is reached
  useEffect(() => {
    if (isOvertime && !dismissed && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification("WorkPulse Shift Alert", {
          body: "You are still clocked in. Don't forget to record your clock-out location before leaving.",
          icon: "/favicon.ico"
        });
      } catch (e) {
        // Ignore in iframe/sandboxed environments
      }
    }
  }, [isOvertime, dismissed]);

  if (!isClockedIn) return null;

  const handleQuickClockOut = async () => {
    setClockingOut(true);
    try {
      await clockOut("Auto reminder prompt sign-off");
      setDismissed(true);
    } finally {
      setClockingOut(false);
    }
  };

  return (
    <div className="space-y-2 font-sans">
      
      {/* Overtime Alert Toast Banner */}
      {isOvertime && !dismissed && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white p-4 rounded-2xl shadow-lg border border-amber-400/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-xs">
              <BellRing className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold tracking-tight">
                  Auto Clock-Out Reminder / Idle Alert
                </h4>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/25 text-white">
                  {formatElapsedSeconds(effectiveSeconds)} Logged
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                You are still clocked in. Don&apos;t forget to record your clock-out location before leaving for the day.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleQuickClockOut}
              disabled={clockingOut}
              className="flex-1 sm:flex-none py-2 px-4 bg-white text-amber-900 hover:bg-amber-50 text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {clockingOut ? (
                <div className="w-3.5 h-3.5 border-2 border-amber-900 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 text-amber-700" />
                  <span>Clock Out Now</span>
                </>
              )}
            </button>

            <button
              onClick={() => setDismissed(true)}
              title="Dismiss for 15 mins"
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Subtle simulation toggle bar for demonstration */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>Active Shift: <strong className="text-slate-800 font-mono">{formatElapsedSeconds(effectiveSeconds)}</strong></span>
          {isOvertime && <span className="text-amber-600 font-bold">(Over 9h Threshold)</span>}
        </div>

        <button
          onClick={() => {
            setSimulatedOvertime(!simulatedOvertime);
            setDismissed(false);
          }}
          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline"
        >
          {simulatedOvertime ? "Reset to Actual Timer" : "Test 9h+ Overtime Alert"}
        </button>
      </div>

    </div>
  );
}
