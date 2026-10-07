"use client";

import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  showSubtitle?: boolean;
  collapsed?: boolean;
  variant?: 'auto' | 'light' | 'dark';
}

export default function BrandLogo({
  className = "",
  size = 'md',
  showBadge = true,
  showSubtitle = false,
  collapsed = false,
  variant = 'auto'
}: BrandLogoProps) {
  // Dimensions based on size
  const iconDimensions = {
    sm: "w-7 h-7",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12",
  }[size];

  const titleSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  }[size];

  const badgeSizes = {
    sm: "text-[9px] px-1 py-0.2",
    md: "text-[10px] px-1.5 py-0.5",
    lg: "text-[11px] px-2 py-0.5",
    xl: "text-xs px-2.5 py-1",
  }[size];

  return (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* User Custom EJ Emblem Logo */}
      <div className={`relative ${iconDimensions} rounded-xl bg-slate-950 border border-slate-800 p-1 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-200`}>
        <img
          src="/logo.png"
          alt="Brand Logo"
          className="w-full h-full object-contain filter contrast-125"
        />
      </div>

      {/* Typography */}
      {!collapsed && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-extrabold tracking-tight font-heading ${titleSizes} ${
              variant === 'light' ? 'text-white' : 'text-slate-900'
            }`}>
              Work<span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Pulse</span>
            </span>

            {showBadge && (
              <span className={`font-extrabold tracking-wider rounded font-mono ${badgeSizes} ${
                variant === 'light'
                  ? 'bg-slate-800 text-indigo-300 border border-slate-700'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}>
                HRM
              </span>
            )}
          </div>

          {showSubtitle && (
            <p className={`text-[10px] font-medium tracking-wide -mt-0.5 ${
              variant === 'light' ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Enterprise Geolocation Platform
            </p>
          )}
        </div>
      )}
    </div>
  );
}
