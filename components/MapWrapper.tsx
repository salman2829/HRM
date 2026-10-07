"use client";

import dynamic from 'next/dynamic';
import React from 'react';
import { User } from '@/lib/types';

const StaffTrackingMap = dynamic(() => import('@/components/StaffTrackingMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[560px] rounded-2xl border border-slate-700/60 bg-slate-900/80 flex flex-col items-center justify-center gap-3 text-slate-400">
      <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="text-sm font-medium">Initializing Interactive Geospatial Radar...</p>
    </div>
  )
});

interface MapWrapperProps {
  users: User[];
  selectedUser: User | null;
  onSelectUser?: (user: User) => void;
  height?: string;
}

export default function MapWrapper(props: MapWrapperProps) {
  return <StaffTrackingMap {...props} />;
}
