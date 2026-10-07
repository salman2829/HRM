"use client";

import React, { useEffect, useRef, useState } from 'react';
import { User } from '@/lib/types';
import { formatTime, formatDate } from '@/lib/utils';
import { DEFAULT_CENTER } from '@/lib/mock-data';
import { useApp } from './AppContext';
import { MapPin, ShieldCheck, Clock, UserCheck, Radio, Lock } from 'lucide-react';

interface StaffTrackingMapProps {
  users: User[];
  selectedUser: User | null;
  onSelectUser?: (user: User) => void;
  height?: string;
}

export default function StaffTrackingMap({
  users,
  selectedUser,
  onSelectUser,
  height = "580px"
}: StaffTrackingMapProps) {
  const { hoveredUserId, setHoveredUserId } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const [mapReady, setMapReady] = useState(false);
  const [filterMode, setFilterMode] = useState<'ALL' | 'CLOCKED_IN' | 'CLOCKED_OUT'>('ALL');

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (!mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const centerLat = selectedUser?.currentLocation?.lat || selectedUser?.lastKnownLocation?.lat || DEFAULT_CENTER.lat;
      const centerLng = selectedUser?.currentLocation?.lng || selectedUser?.lastKnownLocation?.lng || DEFAULT_CENTER.lng;

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Clean OpenStreetMap standard tiles (Zero API key watermark)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
      if (isMounted) setMapReady(true);
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when users list or filter changes
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || typeof window === 'undefined') return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current;

      Object.values(markersRef.current).forEach((marker: any) => marker.remove());
      markersRef.current = {};

      // STRICT PRIVACY RULE: Only render map pins for staff who are currently CLOCKED_IN
      const displayUsers = users.filter(u => {
        if (filterMode === 'CLOCKED_OUT') return false;
        return u.status === 'CLOCKED_IN' && u.currentLocation && typeof u.currentLocation.lat === 'number';
      });

      displayUsers.forEach((user) => {
        const isClockedIn = user.status === 'CLOCKED_IN';
        const loc = user.currentLocation;

        if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return;

        // Custom HTML Marker with Emerald radar ring for active on-duty staff
        const markerHtml = `
          <div class="relative group cursor-pointer" id="map-pin-${user.id}">
            <div class="pulse-ring-emerald"></div>
            <div class="relative flex items-center justify-center w-10 h-10 rounded-full shadow-md transition-all duration-200 transform group-hover:scale-125 bg-emerald-500 border-2 border-white">
              <img 
                src="${user.avatarUrl}" 
                alt="${user.name}" 
                class="w-7 h-7 rounded-full object-cover"
                onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}'"
              />
              <span class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center text-[7px] text-white">
                ✓
              </span>
            </div>
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none">
              ${user.name.split(' ')[0]}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: 'custom-leaflet-pin',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          popupAnchor: [0, -22],
        });

        const popupContent = `
          <div class="p-1 min-w-[240px] text-slate-900 font-sans">
            <div class="flex items-center gap-3 pb-2 border-b border-slate-100">
              <img src="${user.avatarUrl}" class="w-10 h-10 rounded-xl object-cover border border-slate-200" />
              <div>
                <h4 class="font-bold text-sm text-slate-900 leading-tight">${user.name}</h4>
                <p class="text-xs text-indigo-600 font-semibold">${user.jobTitle}</p>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'INTERN' ? 'bg-amber-100 text-amber-800' :
                    'bg-indigo-100 text-indigo-700'
                  }">${user.role}</span>
                  <span class="text-[10px] text-slate-500 font-medium">${user.department}</span>
                </div>
              </div>
            </div>

            <div class="mt-2.5 space-y-1.5 text-xs text-slate-700">
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Live Presence:</span>
                <span class="font-bold px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
                  🟢 CLOCKED IN
                </span>
              </div>

              <div class="flex items-start justify-between gap-2">
                <span class="text-slate-500">Recorded Stamp:</span>
                <span class="font-bold text-slate-800 text-right">
                  ${user.currentShiftStart ? `In at ${formatTime(user.currentShiftStart)}` : 'Active now'}
                </span>
              </div>

              <div class="flex items-start justify-between gap-2">
                <span class="text-slate-500">Address / Zone:</span>
                <span class="font-medium text-slate-800 text-right max-w-[150px] truncate" title="${loc.address || ''}">
                  ${loc.address || `${loc.lat.toFixed(4)}° N, ${loc.lng.toFixed(4)}° E`}
                </span>
              </div>

              <div class="flex items-center justify-between text-[11px] pt-1 text-slate-500 border-t border-slate-100">
                <span>GPS Precision:</span>
                <span class="text-indigo-600 font-mono font-bold">±${loc.accuracy || 10}m</span>
              </div>
            </div>
          </div>
        `;

        const marker = L.marker([loc.lat, loc.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(popupContent);

        marker.on('click', () => {
          if (onSelectUser) onSelectUser(user);
        });

        markersRef.current[user.id] = marker;
      });
    };

    updateMarkers();
  }, [users, mapReady, filterMode, onSelectUser]);

  // Handle selected user smooth pan & popup without re-rendering all markers
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !selectedUser) return;
    const map = mapInstanceRef.current;
    const selLoc = selectedUser.status === 'CLOCKED_IN' ? selectedUser.currentLocation : selectedUser.lastKnownLocation;
    if (selLoc && typeof selLoc.lat === 'number') {
      map.flyTo([selLoc.lat, selLoc.lng], 14, { duration: 0.8 });
      const targetMarker = markersRef.current[selectedUser.id];
      if (targetMarker) {
        targetMarker.openPopup();
      }
    }
  }, [selectedUser, mapReady]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white isolate" style={{ height }}>
      
      {/* Top Map Action Ribbon */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-800">
          <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span>WorkPulse Radar</span>
        </div>

        <div className="h-4 w-px bg-slate-200 mx-0.5"></div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              filterMode === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All ({users.length})
          </button>
          <button
            onClick={() => setFilterMode('CLOCKED_IN')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filterMode === 'CLOCKED_IN'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            On-Duty ({users.filter(u => u.status === 'CLOCKED_IN').length})
          </button>
          <button
            onClick={() => setFilterMode('CLOCKED_OUT')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filterMode === 'CLOCKED_OUT'
                ? 'bg-slate-700 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            Off-Duty ({users.filter(u => u.status === 'CLOCKED_OUT').length})
          </button>
        </div>
      </div>

      {/* Privacy Guard Floating Tag */}
      <div className="absolute top-3 right-3 z-10 hidden sm:flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs text-slate-700 font-semibold">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Privacy-Guarded Coordinates</span>
      </div>

      {/* Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full relative z-0" />

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 shadow-sm text-xs flex items-center gap-4 text-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 animate-pulse"></div>
          <span><strong>Active Shift</strong> (Pulsing Radar)</span>
        </div>
        <div className="h-3 w-px bg-slate-200"></div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-slate-600 border border-white flex items-center justify-center text-[7px] text-white">
            🔒
          </div>
          <span><strong>Last Known Location</strong> (At Clock-Out)</span>
        </div>
      </div>
    </div>
  );
}
