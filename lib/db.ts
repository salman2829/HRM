import fs from 'fs';
import path from 'path';
import { User, AttendanceRecord, InternLogbook, RegularizationRequest, MetricStats, LocationCoordinates } from './types';
import { generateSyntheticHRMData, DEFAULT_CENTER } from './mock-data';

interface DatabaseSchema {
  users: User[];
  attendanceRecords: AttendanceRecord[];
  logbooks: InternLogbook[];
  regularizationRequests: RegularizationRequest[];
  lastUpdated: string;
}

let dbMemoryStore: DatabaseSchema | null = null;

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // Ignore in sandbox
    }
  }
}

function loadDB(): DatabaseSchema {
  if (dbMemoryStore) {
    return dbMemoryStore;
  }

  ensureDataDir();

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      // Ensure we have Deepika Pillai (EMP-001) as first user
      if (parsed && Array.isArray(parsed.users) && parsed.users.length >= 30 && parsed.users[0]?.id === 'EMP-001' && parsed.users[0]?.name === 'Deepika Pillai') {
        if (!parsed.regularizationRequests) {
          parsed.regularizationRequests = [];
        }
        dbMemoryStore = parsed as DatabaseSchema;
        return dbMemoryStore;
      }
    } catch (e) {
      console.error("Error reading db.json, resetting:", e);
    }
  }

  const initial = generateSyntheticHRMData();
  dbMemoryStore = {
    users: initial.users,
    attendanceRecords: initial.attendanceRecords,
    logbooks: initial.logbooks,
    regularizationRequests: initial.regularizationRequests || [],
    lastUpdated: new Date().toISOString(),
  };

  saveDB(dbMemoryStore);
  return dbMemoryStore;
}

function saveDB(data: DatabaseSchema) {
  dbMemoryStore = data;
  try {
    ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.warn("Could not persist to db.json (running in-memory):", e);
  }
}

function sanitizeUserForPrivacy(user: User): User {
  const sanitized = { ...user };
  delete sanitized.password;

  // STRICT PRIVACY RULE: When clocked out or on leave, admin and portal cannot see ambient location!
  if (sanitized.status === 'CLOCKED_OUT' || sanitized.status === 'ON_LEAVE') {
    return {
      ...sanitized,
      currentLocation: null, // Zero active tracking off-hours
    };
  }
  return sanitized;
}

export const db = {
  seed(count: number = 30): { users: User[]; attendanceRecords: AttendanceRecord[]; logbooks: InternLogbook[] } {
    const data = generateSyntheticHRMData();
    const newDb: DatabaseSchema = {
      users: data.users,
      attendanceRecords: data.attendanceRecords,
      logbooks: data.logbooks,
      regularizationRequests: data.regularizationRequests || [],
      lastUpdated: new Date().toISOString(),
    };
    saveDB(newDb);
    return {
      users: data.users.map(sanitizeUserForPrivacy),
      attendanceRecords: data.attendanceRecords,
      logbooks: data.logbooks
    };
  },

  reset(): { users: User[]; attendanceRecords: AttendanceRecord[]; logbooks: InternLogbook[] } {
    return this.seed(30);
  },

  addStaff(additionalCount: number = 10): User[] {
    const database = loadDB();
    const currentCount = database.users.length;
    const newData = generateSyntheticHRMData();
    const newStaff = newData.users.slice(0, additionalCount).map((u, i) => ({
      ...u,
      id: `EMP-${(currentCount + i + 1).toString().padStart(3, '0')}`,
      employeeCode: `EMP-${(currentCount + i + 1).toString().padStart(3, '0')}`,
    }));

    database.users.push(...newStaff);
    database.lastUpdated = new Date().toISOString();
    saveDB(database);

    return database.users.map(sanitizeUserForPrivacy);
  },

  simulateClockOuts(count: number = 5): { modifiedCount: number; users: User[] } {
    const database = loadDB();
    const clockedInUsers = database.users.filter(u => u.status === 'CLOCKED_IN' && u.id !== 'EMP-001');
    const toModify = clockedInUsers.slice(0, count);

    const now = new Date().toISOString();

    toModify.forEach(user => {
      const uIndex = database.users.findIndex(u => u.id === user.id);
      if (uIndex !== -1) {
        const lastLoc = database.users[uIndex].currentLocation || {
          lat: DEFAULT_CENTER.lat,
          lng: DEFAULT_CENTER.lng,
          accuracy: 10,
          address: "Mindspace Cyberabad, HITEC City",
          recordedAt: now
        };

        database.users[uIndex].status = 'CLOCKED_OUT';
        database.users[uIndex].lastClockOut = now;
        database.users[uIndex].lastKnownLocation = { ...lastLoc, recordedAt: now };
        database.users[uIndex].currentLocation = null;
        database.users[uIndex].currentShiftStart = null;

        const recIndex = database.attendanceRecords.findIndex(r => r.userId === user.id && !r.clockOutTime);
        if (recIndex !== -1) {
          database.attendanceRecords[recIndex].clockOutTime = now;
          database.attendanceRecords[recIndex].clockOutCoords = lastLoc;
          database.attendanceRecords[recIndex].durationMinutes = 480;
        }
      }
    });

    database.lastUpdated = now;
    saveDB(database);

    return {
      modifiedCount: toModify.length,
      users: database.users.map(sanitizeUserForPrivacy)
    };
  },

  authenticate(identifier: string, password?: string): User | null {
    const database = loadDB();
    const cleanId = identifier.trim().toLowerCase();
    const cleanNoSpaces = cleanId.replace(/\s+/g, '');

    const user = database.users.find(u => {
      const uEmail = u.email.toLowerCase();
      const uUsername = u.username.toLowerCase();
      const uCode = u.employeeCode.toLowerCase();
      const uId = u.id.toLowerCase();
      const uName = u.name.toLowerCase();
      const uFirstName = u.name.split(' ')[0].toLowerCase();
      const uNameNoSpaces = uName.replace(/\s+/g, '');

      return (
        uUsername === cleanId ||
        uEmail === cleanId ||
        uCode === cleanId ||
        uId === cleanId ||
        uName === cleanId ||
        uFirstName === cleanId ||
        uNameNoSpaces === cleanNoSpaces
      );
    });

    if (!user) return null;

    // Strict Password Verification: Must match current user.password
    if (password !== undefined && password !== null) {
      const enteredPass = password.trim();
      const storedPass = user.password || user.name.split(' ')[0].toLowerCase();

      // Strict match: exact match or case-insensitive match against current stored password
      const isValidPassword = 
        enteredPass === storedPass ||
        enteredPass.toLowerCase() === storedPass.toLowerCase();

      if (!isValidPassword) {
        return null;
      }
    }

    return sanitizeUserForPrivacy(user);
  },

  changePassword(userId: string, oldPass: string, newPass: string): { success: boolean; message: string; user?: User } {
    const database = loadDB();
    const uIndex = database.users.findIndex(u => u.id === userId);
    if (uIndex === -1) {
      return { success: false, message: 'User not found' };
    }

    const user = database.users[uIndex];
    const enteredOld = oldPass.trim();
    const storedPass = user.password || user.name.split(' ')[0].toLowerCase();

    const isOldValid = 
      enteredOld === storedPass ||
      enteredOld.toLowerCase() === storedPass.toLowerCase();

    if (!isOldValid) {
      return { success: false, message: 'Current password does not match' };
    }

    if (!newPass || newPass.trim().length < 3) {
      return { success: false, message: 'New password must be at least 3 characters' };
    }

    // Set new password strictly
    user.password = newPass.trim();
    database.users[uIndex] = user;
    database.lastUpdated = new Date().toISOString();
    saveDB(database);

    return { 
      success: true, 
      message: 'Password changed successfully',
      user: sanitizeUserForPrivacy(user)
    };
  },

  getUsers(filters?: { role?: string; department?: string; status?: string; search?: string }): User[] {
    const database = loadDB();
    let result = database.users;

    if (filters) {
      if (filters.role && filters.role !== 'ALL') {
        result = result.filter(u => u.role === filters.role);
      }
      if (filters.department && filters.department !== 'ALL') {
        result = result.filter(u => u.department.toLowerCase() === filters.department?.toLowerCase());
      }
      if (filters.status && filters.status !== 'ALL') {
        result = result.filter(u => u.status === filters.status);
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        result = result.filter(u =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.username.toLowerCase().includes(query) ||
          u.employeeCode.toLowerCase().includes(query) ||
          u.jobTitle.toLowerCase().includes(query) ||
          u.department.toLowerCase().includes(query)
        );
      }
    }

    return result.map(sanitizeUserForPrivacy);
  },

  getUserById(id: string): User | null {
    const database = loadDB();
    const user = database.users.find(u => u.id === id);
    if (!user) return null;
    return sanitizeUserForPrivacy(user);
  },

  getMetrics(): MetricStats {
    const database = loadDB();
    const users = database.users;

    const totalWorkforce = users.length;
    const clockedInCount = users.filter(u => u.status === 'CLOCKED_IN').length;
    const activeInternsCount = users.filter(u => u.role === 'INTERN').length;
    const onLeaveCount = users.filter(u => u.status === 'ON_LEAVE').length;

    const departmentBreakdown: Record<string, number> = {};
    const roleBreakdown: Record<string, number> = {};

    users.forEach(u => {
      departmentBreakdown[u.department] = (departmentBreakdown[u.department] || 0) + 1;
      roleBreakdown[u.role] = (roleBreakdown[u.role] || 0) + 1;
    });

    return {
      totalWorkforce,
      clockedInCount,
      activeInternsCount,
      onLeaveCount,
      departmentBreakdown,
      roleBreakdown,
    };
  },

  clockIn(userId: string, coords: LocationCoordinates, notes?: string): { user: User; record: AttendanceRecord } {
    const database = loadDB();
    const userIndex = database.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const todayStr = nowIso.split('T')[0];

    const targetUser = database.users[userIndex];

    const targetLat = (coords && typeof coords.lat === 'number') ? coords.lat : DEFAULT_CENTER.lat;
    const targetLng = (coords && typeof coords.lng === 'number') ? coords.lng : DEFAULT_CENTER.lng;

    const enrichedCoords: LocationCoordinates = {
      lat: targetLat,
      lng: targetLng,
      accuracy: (coords && coords.accuracy) || 8,
      address: (coords && coords.address) || `${targetLat.toFixed(4)}° N, ${targetLng.toFixed(4)}° E`,
      recordedAt: nowIso,
      updatedAt: nowIso,
    };

    targetUser.status = 'CLOCKED_IN';
    targetUser.currentShiftStart = nowIso;
    targetUser.currentLocation = enrichedCoords;
    targetUser.lastKnownLocation = null;

    const newRecord: AttendanceRecord = {
      id: `att-${userId}-${Date.now()}`,
      userId: targetUser.id,
      userName: targetUser.name,
      userRole: targetUser.role,
      department: targetUser.department,
      date: todayStr,
      clockInTime: nowIso,
      clockOutTime: null,
      durationMinutes: null,
      clockInCoords: enrichedCoords,
      clockOutCoords: null,
      notes: notes || "Shift Check-in via WorkPulse Terminal",
      deviceType: "Browser Web Client"
    };

    database.attendanceRecords.unshift(newRecord);
    database.users[userIndex] = targetUser;
    database.lastUpdated = nowIso;

    saveDB(database);

    return {
      user: sanitizeUserForPrivacy(targetUser),
      record: newRecord,
    };
  },

  clockOut(userId: string, coords?: LocationCoordinates, notes?: string): { user: User; record: AttendanceRecord } {
    const database = loadDB();
    const userIndex = database.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const targetUser = database.users[userIndex];

    const targetLat = (coords && typeof coords.lat === 'number') ? coords.lat : (targetUser.currentLocation ? targetUser.currentLocation.lat : DEFAULT_CENTER.lat);
    const targetLng = (coords && typeof coords.lng === 'number') ? coords.lng : (targetUser.currentLocation ? targetUser.currentLocation.lng : DEFAULT_CENTER.lng);

    const enrichedCoords: LocationCoordinates = {
      lat: targetLat,
      lng: targetLng,
      accuracy: (coords && coords.accuracy) || 8,
      address: (coords && coords.address) || (targetUser.currentLocation?.address ? targetUser.currentLocation.address : `${targetLat.toFixed(4)}° N, ${targetLng.toFixed(4)}° E`),
      recordedAt: nowIso,
    };

    let durationMinutes = 0;
    if (targetUser.currentShiftStart) {
      const startMs = new Date(targetUser.currentShiftStart).getTime();
      const endMs = now.getTime();
      durationMinutes = Math.max(1, Math.round((endMs - startMs) / (1000 * 60)));
    }

    targetUser.status = 'CLOCKED_OUT';
    targetUser.lastClockOut = nowIso;
    targetUser.lastKnownLocation = enrichedCoords;
    targetUser.currentLocation = null;
    targetUser.currentShiftStart = null;

    const recordIndex = database.attendanceRecords.findIndex(
      r => r.userId === userId && !r.clockOutTime
    );

    let updatedRecord: AttendanceRecord;

    if (recordIndex !== -1) {
      database.attendanceRecords[recordIndex].clockOutTime = nowIso;
      database.attendanceRecords[recordIndex].clockOutCoords = enrichedCoords;
      database.attendanceRecords[recordIndex].durationMinutes = durationMinutes;
      if (notes) {
        database.attendanceRecords[recordIndex].notes = notes;
      }
      updatedRecord = database.attendanceRecords[recordIndex];
    } else {
      updatedRecord = {
        id: `att-${userId}-${Date.now()}`,
        userId: targetUser.id,
        userName: targetUser.name,
        userRole: targetUser.role,
        department: targetUser.department,
        date: nowIso.split('T')[0],
        clockInTime: new Date(now.getTime() - durationMinutes * 60000).toISOString(),
        clockOutTime: nowIso,
        durationMinutes,
        clockInCoords: enrichedCoords,
        clockOutCoords: enrichedCoords,
        notes: notes || "Shift completed",
        deviceType: "Browser Web Client"
      };
      database.attendanceRecords.unshift(updatedRecord);
    }

    database.users[userIndex] = targetUser;
    database.lastUpdated = nowIso;

    saveDB(database);

    return {
      user: sanitizeUserForPrivacy(targetUser),
      record: updatedRecord,
    };
  },

  updateLocation(userId: string, coords: LocationCoordinates): User {
    const database = loadDB();
    const userIndex = database.users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");

    const user = database.users[userIndex];
    if (user.status !== 'CLOCKED_IN') {
      return sanitizeUserForPrivacy(user);
    }

    const nowIso = new Date().toISOString();
    user.currentLocation = {
      ...coords,
      updatedAt: nowIso,
    };

    database.users[userIndex] = user;
    database.lastUpdated = nowIso;
    saveDB(database);

    return sanitizeUserForPrivacy(user);
  },

  getAttendanceRecords(userId?: string): AttendanceRecord[] {
    const database = loadDB();
    if (userId) {
      return database.attendanceRecords.filter(r => r.userId === userId);
    }
    return database.attendanceRecords;
  },

  getLogbooks(internId?: string): InternLogbook[] {
    const database = loadDB();
    if (internId) {
      return database.logbooks.filter(l => l.internId === internId);
    }
    return database.logbooks;
  },

  submitLogbook(data: {
    internId: string;
    internName: string;
    weekNumber: number;
    year: number;
    milestonesCompleted: string;
    tasksCompleted: string;
    learnings: string;
    blockers: string;
  }): InternLogbook {
    const database = loadDB();
    const intern = database.users.find(u => u.id === data.internId);

    const newLogbook: InternLogbook = {
      id: `log-${data.internId}-${Date.now()}`,
      internId: data.internId,
      internName: data.internName || (intern ? intern.name : "Intern"),
      mentorId: intern?.mentorId || undefined,
      weekNumber: data.weekNumber || 41,
      year: data.year || new Date().getFullYear(),
      submissionDate: new Date().toISOString(),
      milestonesCompleted: data.milestonesCompleted,
      tasksCompleted: data.tasksCompleted,
      learnings: data.learnings,
      blockers: data.blockers || "None",
      status: 'UNDER_REVIEW',
    };

    database.logbooks.unshift(newLogbook);
    database.lastUpdated = new Date().toISOString();
    saveDB(database);

    return newLogbook;
  },

  updateLogbookStatus(logbookId: string, status: 'APPROVED' | 'NEEDS_REVISION', feedback?: string): InternLogbook {
    const database = loadDB();
    const index = database.logbooks.findIndex(l => l.id === logbookId);
    if (index === -1) throw new Error("Logbook entry not found");

    database.logbooks[index].status = status;
    if (feedback) {
      database.logbooks[index].mentorFeedback = feedback;
    }
    database.logbooks[index].reviewedAt = new Date().toISOString();

    saveDB(database);
    return database.logbooks[index];
  },

  getRegularizations(userId?: string): RegularizationRequest[] {
    const database = loadDB();
    if (userId) {
      return (database.regularizationRequests || []).filter(r => r.userId === userId);
    }
    return database.regularizationRequests || [];
  },

  submitRegularization(data: {
    userId: string;
    userName: string;
    userRole: any;
    type: 'REGULARIZATION' | 'LEAVE';
    date: string;
    endDate?: string;
    proposedClockIn?: string;
    proposedClockOut?: string;
    leaveType?: 'CASUAL' | 'SICK' | 'PAID' | 'PRIVILEGE';
    reason: string;
  }): RegularizationRequest {
    const database = loadDB();
    if (!database.regularizationRequests) {
      database.regularizationRequests = [];
    }

    const user = database.users.find(u => u.id === data.userId);

    const newRequest: RegularizationRequest = {
      id: `reg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: data.userId,
      userName: data.userName || (user ? user.name : "Employee"),
      userRole: data.userRole || (user ? user.role : "EMPLOYEE"),
      type: data.type,
      date: data.date,
      endDate: data.endDate,
      proposedClockIn: data.proposedClockIn,
      proposedClockOut: data.proposedClockOut,
      leaveType: data.leaveType,
      reason: data.reason,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
      managerName: user?.managerName || "Deepika Pillai"
    };

    database.regularizationRequests.unshift(newRequest);
    database.lastUpdated = new Date().toISOString();
    saveDB(database);

    return newRequest;
  },

  updateRegularizationStatus(id: string, status: 'APPROVED' | 'REJECTED', managerNotes?: string): RegularizationRequest {
    const database = loadDB();
    if (!database.regularizationRequests) {
      database.regularizationRequests = [];
    }
    const index = database.regularizationRequests.findIndex(r => r.id === id);
    if (index === -1) throw new Error("Regularization request not found");

    database.regularizationRequests[index].status = status;
    if (managerNotes) {
      database.regularizationRequests[index].managerNotes = managerNotes;
    }
    database.lastUpdated = new Date().toISOString();
    saveDB(database);

    return database.regularizationRequests[index];
  }
};
