"use client";

import React, { useState } from 'react';
import { useApp, LOCATION_PRESETS } from './AppContext';
import { formatElapsedSeconds, formatTime, calculateDistanceKm } from '@/lib/utils';
import { 
  Clock, 
  MapPin, 
  Compass, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  LogIn, 
  LogOut,
  Navigation,
  ShieldCheck
} from 'lucide-react';

export default function AttendanceWidget() {
  const { 
    currentUser, 
    clockIn, 
    clockOut, 
    liveElapsedSeconds,
    simulatedCoords,
    setSimulatedCoords,
    useBrowserGps,
    setUseBrowserGps,
    currentGpsStatus
  } = useApp();

  const [notes, setNotes] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [customLat, setCustomLat] = useState(simulatedCoords.lat.toString());
  const [customLng, setCustomLng] = useState(simulatedCoords.lng.toString());
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!currentUser) return null;

  const isClockedIn = currentUser.status === 'CLOCKED_IN';

  const handleClockInAction = async () => {
    if (loadingAction) return;
    setLoadingAction(true);
    setFeedback(null);
    try {
      const res = await clockIn(notes);
      if (res.success) {
        setFeedback({ type: 'success', text: res.message });
        setNotes('');
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const handleClockOutAction = async () => {
    if (loadingAction) return;
    setLoadingAction(true);
    setFeedback(null);
    try {
      const res = await clockOut(notes);
      if (res.success) {
        setFeedback({ type: 'success', text: res.message });
        setNotes('');
      } else {
        setFeedback({ type: 'error', text: res.message });
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const handleApplyCustomCoords = () => {
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (isNaN(lat) || isNaN(lng)) {
      setFeedback({ type: 'error', text: 'Please enter valid numerical coordinates' });
      return;
    }
    setUseBrowserGps(false);
    setSimulatedCoords({
      lat,
      lng,
      accuracy: 5,
      address: `Custom Coord (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    });
    setFeedback({ type: 'success', text: `Set location to ${lat}, ${lng}` });
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
      
      {/* Header with Large Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase">
            Shift Geolocation Terminal
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Attendance Command
          </h2>
        </div>

        <div>
          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
            isClockedIn
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${
              isClockedIn ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
            }`}></span>
            {isClockedIn ? 'CURRENTLY WORKING (ON DUTY)' : 'SHIFT ENDED (OFFLINE)'}
          </span>
        </div>
      </div>

      {/* Hero Stopwatch & Geolocation Sensor Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Digital Running Stopwatch (7 cols) */}
        <div className="md:col-span-7 bg-slate-900 text-white rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Clock className="w-4 h-4 text-indigo-400" />
              {isClockedIn ? 'Elapsed Shift Duration Today' : 'Last Session Recorded'}
            </span>
            <span className="text-[11px] font-mono text-indigo-400 font-bold">LIVE TIMER</span>
          </div>

          <div className="my-4">
            <div className="text-4xl sm:text-5xl font-mono font-bold tracking-wider text-white">
              {isClockedIn ? formatElapsedSeconds(liveElapsedSeconds) : "00:00:00"}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isClockedIn 
                ? `Clocked in at ${formatTime(currentUser.currentShiftStart)}` 
                : currentUser.lastClockOut 
                  ? `Last clocked out at ${formatTime(currentUser.lastClockOut)}` 
                  : 'Ready to commence daily shift'}
            </p>
          </div>

          {/* Shift handover/notes input */}
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={isClockedIn ? "Add shift handover note or milestone..." : "Optional shift goal..."}
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-400"
          />
        </div>

        {/* Sensor & GPS Verification Card (5 cols) */}
        <div className="md:col-span-5 bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-600" />
                GPS Status
              </span>
              <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ±{simulatedCoords.accuracy || 8}m
              </span>
            </div>

            <div className="mt-3 space-y-1.5 text-xs">
              <p className="font-bold text-slate-900 truncate" title={simulatedCoords.address || ''}>
                {simulatedCoords.address || "Hyderabad Tech Corridor"}
              </p>
              
              {/* Geofence Detection Tag */}
              {(() => {
                const dist = calculateDistanceKm(simulatedCoords.lat, simulatedCoords.lng, LOCATION_PRESETS[0].lat, LOCATION_PRESETS[0].lng);
                const isInside = dist <= 0.45;
                return (
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                    isInside 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    <span>{isInside ? '🏢 Inside HQ Geofence (≤450m)' : `🏠 Remote / WFH (${dist} km away)`}</span>
                  </div>
                );
              })()}

              <p className="text-slate-500 font-mono text-[11px]">
                LAT: <span className="font-bold text-slate-800">{simulatedCoords.lat.toFixed(5)}</span> • LNG: <span className="font-bold text-slate-800">{simulatedCoords.lng.toFixed(5)}</span>
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold pt-0.5">
                ✓ {useBrowserGps ? 'Location verified via Hardware GPS' : 'Location active via Simulation Mode'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowOverride(!showOverride)}
            className="mt-3 text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showOverride ? 'Hide Simulation Form' : 'Test / Override Coordinates'}</span>
          </button>
        </div>

      </div>

      {/* Manual GPS Simulation Form (Expandable) */}
      {showOverride && (
        <div className="bg-slate-50 rounded-2xl p-4 border border-indigo-200 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              Coordinate Simulation Form
            </span>
            <span className="text-[10px] text-slate-500">For sandboxes & environments without device GPS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={customLat}
                onChange={(e) => setCustomLat(e.target.value)}
                className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono focus:border-indigo-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={customLng}
                onChange={(e) => setCustomLng(e.target.value)}
                className="w-full mt-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono focus:border-indigo-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap gap-1.5">
              {LOCATION_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => {
                    setCustomLat(p.lat.toString());
                    setCustomLng(p.lng.toString());
                    setSimulatedCoords({ lat: p.lat, lng: p.lng, address: p.address, accuracy: 5 });
                  }}
                  className="text-[10px] font-semibold px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-700 border border-slate-200"
                >
                  {p.name.split(' ')[0]}
                </button>
              ))}
            </div>

            <button
              onClick={handleApplyCustomCoords}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Apply Coordinates
            </button>
          </div>
        </div>
      )}

      {/* Two Prominent Primary Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Clock In Button */}
        <button
          onClick={handleClockInAction}
          disabled={isClockedIn || loadingAction}
          className={`py-3.5 px-5 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2.5 transition-all ${
            isClockedIn
              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-[0.99]'
          }`}
        >
          {loadingAction && !isClockedIn ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Clock In (GPS Stamp)</span>
            </>
          )}
        </button>

        {/* Clock Out Button */}
        <button
          onClick={handleClockOutAction}
          disabled={!isClockedIn || loadingAction}
          className={`py-3.5 px-5 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2.5 transition-all ${
            !isClockedIn
              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              : 'bg-white hover:bg-rose-50 text-rose-600 border border-rose-300 hover:border-rose-400 active:scale-[0.99]'
          }`}
        >
          {loadingAction && isClockedIn ? (
            <div className="w-5 h-5 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
          ) : (
            <>
              <LogOut className="w-4 h-4" />
              <span>Clock Out & Freeze Location</span>
            </>
          )}
        </button>

      </div>

      {/* Privacy Guarantee Note */}
      <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span>Privacy Protected: Coordinates are frozen upon clocking out. Off-hours tracking is permanently halted.</span>
      </div>

      {/* Action Feedback */}
      {feedback && (
        <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
          feedback.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

    </div>
  );
}
