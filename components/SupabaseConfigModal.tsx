"use client";

import React, { useState, useEffect } from 'react';
import { getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig } from '@/lib/supabase';
import { Database, Key, CheckCircle2, AlertCircle, X, ExternalLink, Sparkles } from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupabaseConfigModal({ isOpen, onClose }: SupabaseConfigModalProps) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.isCustom ? config.url : '');
      setAnonKey(config.isCustom ? config.anonKey : '');
      setIsCustom(config.isCustom);
      setStatusMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!url.trim() || !anonKey.trim()) {
      setStatusMsg({ type: 'error', text: 'Please provide both Supabase Project URL and Anon Key.' });
      return;
    }

    try {
      new URL(url.trim()); // Validate URL format
      saveSupabaseConfig(url, anonKey);
      setIsCustom(true);
      setStatusMsg({ type: 'success', text: 'Supabase credentials saved & active!' });
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1200);
    } catch {
      setStatusMsg({ type: 'error', text: 'Invalid URL format. Must start with https://' });
    }
  };

  const handleClear = () => {
    clearSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setIsCustom(false);
    setStatusMsg({ type: 'success', text: 'Reset to local auth engine.' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Supabase Configuration</h3>
              <p className="text-xs text-slate-500">Connect your live Supabase project</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status pill */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <span className="text-slate-600 font-semibold">Active Auth Mode:</span>
          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
            isCustom
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
          }`}>
            {isCustom ? '🟢 Live Custom Supabase Connected' : '⚡ Local High-Speed Session Engine'}
          </span>
        </div>

        {/* Form Inputs */}
        <div className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Project URL (<code className="text-emerald-700">NEXT_PUBLIC_SUPABASE_URL</code>)
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Anon / Public API Key (<code className="text-emerald-700">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>)
            </label>
            <textarea
              rows={3}
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-mono text-[11px] focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>

          <p className="text-[11px] text-slate-500">
            Keys can also be configured directly in your <code className="bg-slate-100 px-1 py-0.5 rounded">.env.local</code> file.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          {isCustom ? (
            <button
              onClick={handleClear}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
            >
              Reset to Local
            </button>
          ) : <div></div>}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Save & Connect
            </button>
          </div>
        </div>

        {/* Status Feedback */}
        {statusMsg && (
          <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

      </div>
    </div>
  );
}
