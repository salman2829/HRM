import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default fallback mock values
const DEFAULT_URL = 'https://mock-hrm-project.supabase.co';
const DEFAULT_KEY = 'mock-anon-key-enterprise-hrm-2026';

let runtimeClient: SupabaseClient | null = null;

export function getSupabaseConfig(): { url: string; anonKey: string; isCustom: boolean } {
  if (typeof window !== 'undefined') {
    const storedUrl = localStorage.getItem('supabase_url');
    const storedKey = localStorage.getItem('supabase_anon_key');
    if (storedUrl && storedKey) {
      return { url: storedUrl, anonKey: storedKey, isCustom: true };
    }
  }

  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (envUrl && envKey && envUrl !== DEFAULT_URL) {
    return { url: envUrl, anonKey: envKey, isCustom: true };
  }

  return { url: DEFAULT_URL, anonKey: DEFAULT_KEY, isCustom: false };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('supabase_url', url.trim());
    localStorage.setItem('supabase_anon_key', anonKey.trim());
    runtimeClient = createClient(url.trim(), anonKey.trim());
  }
}

export function clearSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_anon_key');
    runtimeClient = null;
  }
}

export function isSupabaseConfigured(): boolean {
  const config = getSupabaseConfig();
  return config.isCustom;
}

export function getSupabaseClient(): SupabaseClient {
  const config = getSupabaseConfig();
  if (!runtimeClient) {
    runtimeClient = createClient(config.url, config.anonKey);
  }
  return runtimeClient;
}

export const supabase = getSupabaseClient();
