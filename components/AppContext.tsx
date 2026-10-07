"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, UserRole, AttendanceRecord, InternLogbook, MetricStats, LocationCoordinates } from '@/lib/types';
import { DEFAULT_CENTER } from '@/lib/mock-data';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface LocationPreset {
  name: string;
  lat: number;
  lng: number;
  address: string;
}

export const LOCATION_PRESETS: LocationPreset[] = [
  { name: "Cyber Towers (HQ)", lat: 17.4504, lng: 78.3808, address: "Cyber Towers, Hitec City, Hyderabad" },
  { name: "Financial District Hub", lat: 17.4156, lng: 78.3427, address: "Financial District, Gachibowli, Hyderabad" },
  { name: "Jubilee Hills Center", lat: 17.4319, lng: 78.4073, address: "Road No 36, Jubilee Hills, Hyderabad" },
  { name: "Kondapur Tech Park", lat: 17.4699, lng: 78.3578, address: "Kondapur Green Valley, Hyderabad" },
  { name: "Banjara Hills Office", lat: 17.4168, lng: 78.4382, address: "Road No 12, Banjara Hills, Hyderabad" },
];

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  users: User[];
  metrics: MetricStats | null;
  attendanceHistory: AttendanceRecord[];
  logbooks: InternLogbook[];
  loading: boolean;
  seeding: boolean;
  isAuthenticated: boolean;
  showAuthModal: boolean;
  authModalRole: UserRole | null;
  openAuthModal: (targetRole?: UserRole) => void;
  closeAuthModal: () => void;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; message: string; user?: User }>;
  logout: () => Promise<void>;
  simulatedCoords: LocationCoordinates;
  setSimulatedCoords: (coords: LocationCoordinates) => void;
  useBrowserGps: boolean;
  setUseBrowserGps: (val: boolean) => void;
  currentGpsStatus: string;
  gpsPermissionDenied: boolean;
  refreshData: () => Promise<void>;
  clockIn: (notes?: string) => Promise<{ success: boolean; message: string }>;
  clockOut: (notes?: string) => Promise<{ success: boolean; message: string }>;
  reseedData: (count?: number) => Promise<void>;
  addStaff: (count?: number) => Promise<void>;
  resetDatabase: () => Promise<void>;
  simulateClockOuts: (count?: number) => Promise<void>;
  submitLogbook: (data: { milestonesCompleted: string; tasksCompleted: string; learnings: string; blockers: string; weekNumber: number }) => Promise<{ success: boolean; message: string }>;
  reviewLogbook: (logbookId: string, status: 'APPROVED' | 'NEEDS_REVISION', feedback?: string) => Promise<void>;
  liveElapsedSeconds: number;
  selectedStaffForDetail: User | null;
  setSelectedStaffForDetail: (user: User | null) => void;
  hoveredUserId: string | null;
  setHoveredUserId: (id: string | null) => void;
  filterDepartment: string;
  setFilterDepartment: (dept: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterRole: string;
  setFilterRole: (role: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  toasts: ToastItem[];
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Ensure application remains in crisp, clean Light Mode
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('workpulse_theme');
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  }, []);

  const [role, setRoleState] = useState<UserRole>('ADMIN');
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [metrics, setMetrics] = useState<MetricStats | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [logbooks, setLogbooks] = useState<InternLogbook[]>([]);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [selectedStaffForDetail, setSelectedStaffForDetail] = useState<User | null>(null);
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);

  // Dedicated Auth Modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole | null>(null);

  const openAuthModal = (targetRole?: UserRole) => {
    if (targetRole) setAuthModalRole(targetRole);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const [filterDepartment, setFilterDepartment] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterRole, setFilterRole] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [useBrowserGps, setUseBrowserGps] = useState(false);
  const [gpsPermissionDenied, setGpsPermissionDenied] = useState(false);
  const [currentGpsStatus, setCurrentGpsStatus] = useState<string>("Ready (Office Simulation Active)");
  const [simulatedCoords, setSimulatedCoords] = useState<LocationCoordinates>({
    lat: LOCATION_PRESETS[0].lat,
    lng: LOCATION_PRESETS[0].lng,
    accuracy: 8,
    address: LOCATION_PRESETS[0].address,
  });

  const [liveElapsedSeconds, setLiveElapsedSeconds] = useState(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (title: string, message?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev.slice(-3), { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Ultra-fast non-blocking data fetching
  const fetchData = useCallback(async () => {
    try {
      const [usersRes, metricsRes, recordsRes, logbooksRes, authRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/metrics'),
        fetch('/api/attendance'),
        fetch('/api/logbooks'),
        fetch('/api/auth/me'),
      ]);

      const [usersJson, metricsJson, recordsJson, logbooksJson, authJson] = await Promise.all([
        usersRes.json(),
        metricsRes.json(),
        recordsRes.json(),
        logbooksRes.json(),
        authRes.json(),
      ]);

      if (usersJson.success && usersJson.users) {
        setUsers(usersJson.users);
      }

      if (authJson.success && authJson.user) {
        setCurrentUserState(authJson.user);
        setRoleState(authJson.user.role);
      }

      if (metricsJson.success) setMetrics(metricsJson.metrics);
      if (recordsJson.success) setAttendanceHistory(recordsJson.records);
      if (logbooksJson.success) setLogbooks(logbooksJson.logbooks);
    } catch (e) {
      console.error("Failed to load WorkPulse state", e);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!currentUser || currentUser.status !== 'CLOCKED_IN' || !currentUser.currentShiftStart) {
      setLiveElapsedSeconds(0);
      return;
    }

    const updateTimer = () => {
      const start = new Date(currentUser.currentShiftStart!).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - start) / 1000));
      setLiveElapsedSeconds(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const getActiveCoordinates = async (): Promise<LocationCoordinates> => {
    if (useBrowserGps && typeof window !== 'undefined' && navigator.geolocation) {
      try {
        setCurrentGpsStatus("Pinging device GPS hardware...");
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 6000,
            maximumAge: 5000,
          });
        });
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const accuracy = Math.round(pos.coords.accuracy);
        setCurrentGpsStatus(`GPS Verified (±${accuracy}m)`);
        setGpsPermissionDenied(false);
        return {
          lat,
          lng,
          accuracy,
          address: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E (GPS)`,
          recordedAt: new Date().toISOString(),
        };
      } catch (err: any) {
        console.warn("GPS request denied/blocked:", err.message);
        setGpsPermissionDenied(true);
        setCurrentGpsStatus("Location access disabled. Falling back to simulation mode");
      }
    }
    return {
      ...simulatedCoords,
      recordedAt: new Date().toISOString(),
    };
  };

  const login = async (identifier: string, password?: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUserState(data.user);
        setRoleState(data.user.role);
        showToast("Authenticated Successfully", `Welcome to WorkPulse, ${data.user.name}`, "success");
        return { success: true, message: data.message, user: data.user };
      }
      showToast("Authentication Failed", data.error || "Invalid username or password", "error");
      return { success: false, message: data.error || 'Invalid credentials' };
    } catch (e: any) {
      showToast("Authentication Error", e.message, "error");
      return { success: false, message: e.message };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUserState(null);
      showToast("Signed Out", "You have been disconnected from the session", "info");
    } catch (e) {
      console.error("Logout failed:", e);
      setCurrentUserState(null);
    }
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (users.length > 0) {
      const targetUser = users.find(u => u.role === newRole);
      if (targetUser) {
        setCurrentUserState(targetUser);
      }
    }
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    setRoleState(user.role);
  };

  // Optimistic Clock-In
  const clockIn = async (notes?: string) => {
    if (!currentUser) return { success: false, message: "No active user selected" };
    
    const nowIso = new Date().toISOString();
    const coords = await getActiveCoordinates();

    // Optimistic state update
    const previousUser = { ...currentUser };
    const optimisticUser: User = {
      ...currentUser,
      status: 'CLOCKED_IN',
      currentShiftStart: nowIso,
      currentLocation: coords,
      lastKnownLocation: null,
    };
    setCurrentUserState(optimisticUser);

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CLOCK_IN',
          userId: currentUser.id,
          coords,
          notes: notes || "Shift Check-in via WorkPulse Presence Terminal",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCurrentUserState(data.user);
        await fetchData();
        showToast("Shift Started", `Clocked in successfully from ${coords.address || `${coords.lat}, ${coords.lng}`}`, "success");
        return { success: true, message: `Clocked in at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` };
      }
      setCurrentUserState(previousUser);
      showToast("Clock-In Failed", data.error, "error");
      return { success: false, message: data.error || "Clock-in failed" };
    } catch (err: any) {
      setCurrentUserState(previousUser);
      showToast("Clock-In Error", err.message, "error");
      return { success: false, message: err.message };
    }
  };

  // Optimistic Clock-Out
  const clockOut = async (notes?: string) => {
    if (!currentUser) return { success: false, message: "No active user selected" };

    const nowIso = new Date().toISOString();
    const coords = await getActiveCoordinates();

    // Optimistic state update
    const previousUser = { ...currentUser };
    const optimisticUser: User = {
      ...currentUser,
      status: 'CLOCKED_OUT',
      lastClockOut: nowIso,
      lastKnownLocation: coords,
      currentLocation: null,
      currentShiftStart: null,
    };
    setCurrentUserState(optimisticUser);

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CLOCK_OUT',
          userId: currentUser.id,
          coords,
          notes: notes || "Shift Completed",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCurrentUserState(data.user);
        await fetchData();
        showToast("Shift Ended", `Coordinates frozen at ${coords.address || `${coords.lat}, ${coords.lng}`}`, "info");
        return { success: true, message: `Shift completed at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` };
      }
      setCurrentUserState(previousUser);
      showToast("Clock-Out Failed", data.error, "error");
      return { success: false, message: data.error || "Clock-out failed" };
    } catch (err: any) {
      setCurrentUserState(previousUser);
      showToast("Clock-Out Error", err.message, "error");
      return { success: false, message: err.message };
    }
  };

  // Seeder Toolbar Actions
  const reseedData = async (count: number = 26) => {
    try {
      setSeeding(true);
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
        showToast("Database Seeded", `${data.usersCount} team members refreshed with live GPS trails`, "success");
      }
    } catch (err) {
      showToast("Seeder Failed", "Unable to seed dataset", "error");
    } finally {
      setSeeding(false);
    }
  };

  const addStaff = async (count: number = 10) => {
    try {
      setSeeding(true);
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ADD_STAFF', count }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
        showToast("Staff Added", `Created ${count} new synthetic employees across departments`, "success");
      }
    } catch (err) {
      showToast("Failed to Add Staff", "Error adding employees", "error");
    } finally {
      setSeeding(false);
    }
  };

  const resetDatabase = async () => {
    try {
      setSeeding(true);
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET' }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
        showToast("Demo Reset", "Database reset to initial 26 Indian employees", "info");
      }
    } catch (err) {
      showToast("Reset Failed", "Error resetting database", "error");
    } finally {
      setSeeding(false);
    }
  };

  const simulateClockOuts = async (count: number = 5) => {
    try {
      setSeeding(true);
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SIMULATE_CLOCKOUT', count }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
        showToast("Simulated Clock-Outs", `Simulated off-duty freeze for ${data.modifiedCount} employees`, "info");
      }
    } catch (err) {
      showToast("Simulation Failed", "Error simulating clock-outs", "error");
    } finally {
      setSeeding(false);
    }
  };

  const submitLogbook = async (data: {
    milestonesCompleted: string;
    tasksCompleted: string;
    learnings: string;
    blockers: string;
    weekNumber: number;
  }) => {
    if (!currentUser) return { success: false, message: "No user selected" };
    try {
      const res = await fetch('/api/logbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          internId: currentUser.id,
          internName: currentUser.name,
          ...data,
          year: new Date().getFullYear(),
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        await fetchData();
        showToast("Logbook Submitted", `Week ${data.weekNumber} sprint report submitted for mentor review`, "success");
        return { success: true, message: "Weekly logbook submitted for mentor review!" };
      }
      showToast("Submission Error", resJson.error, "error");
      return { success: false, message: resJson.error || "Submission failed" };
    } catch (err: any) {
      showToast("Submission Error", err.message, "error");
      return { success: false, message: err.message };
    }
  };

  const reviewLogbook = async (logbookId: string, status: 'APPROVED' | 'NEEDS_REVISION', feedback?: string) => {
    try {
      await fetch('/api/logbooks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logbookId,
          status,
          feedback: feedback || "Reviewed by Senior Mentor",
        }),
      });
      await fetchData();
      showToast("Logbook Reviewed", `Report marked as ${status === 'APPROVED' ? 'Approved' : 'Needs Revision'}`, "success");
    } catch (err) {
      showToast("Review Failed", "Error saving evaluation", "error");
    }
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        setCurrentUser,
        users,
        metrics,
        attendanceHistory,
        logbooks,
        loading,
        seeding,
        isAuthenticated: Boolean(currentUser),
        showAuthModal,
        authModalRole,
        openAuthModal,
        closeAuthModal,
        login,
        logout,
        simulatedCoords,
        setSimulatedCoords,
        useBrowserGps,
        setUseBrowserGps,
        currentGpsStatus,
        gpsPermissionDenied,
        refreshData: fetchData,
        clockIn,
        clockOut,
        reseedData,
        addStaff,
        resetDatabase,
        simulateClockOuts,
        submitLogbook,
        reviewLogbook,
        liveElapsedSeconds,
        selectedStaffForDetail,
        setSelectedStaffForDetail,
        hoveredUserId,
        setHoveredUserId,
        filterDepartment,
        setFilterDepartment,
        filterStatus,
        setFilterStatus,
        filterRole,
        setFilterRole,
        searchQuery,
        setSearchQuery,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}

      {/* Global Toast Notification Viewport */}
      <div className="fixed bottom-24 right-6 z-[1000] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl border shadow-xl flex items-start gap-3 animate-in slide-in-from-bottom-3 duration-200 ${
              toast.type === 'success'
                ? 'bg-white text-slate-900 border-emerald-300 shadow-emerald-500/10'
                : toast.type === 'error'
                  ? 'bg-white text-slate-900 border-rose-300 shadow-rose-500/10'
                  : 'bg-slate-900 text-white border-slate-800 shadow-slate-900/20'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              ) : (
                <Info className="w-4 h-4 text-indigo-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-xs font-bold ${toast.type === 'info' ? 'text-white' : 'text-slate-900'}`}>
                {toast.title}
              </p>
              {toast.message && (
                <p className={`text-[11px] mt-0.5 leading-snug ${toast.type === 'info' ? 'text-slate-300' : 'text-slate-600'}`}>
                  {toast.message}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className={`p-1 rounded-lg hover:bg-slate-100 transition-colors ${toast.type === 'info' ? 'hover:bg-slate-800 text-slate-400' : 'text-slate-400 hover:text-slate-700'}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
