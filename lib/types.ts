export type UserRole = 'ADMIN' | 'EMPLOYEE' | 'INTERN';

export type AttendanceStatus = 'CLOCKED_IN' | 'CLOCKED_OUT' | 'ON_LEAVE';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  address?: string;
  recordedAt?: string;
  updatedAt?: string;
}

export interface LeaveBalance {
  annualLeave: { total: number; used: number; remaining: number };
  sickLeave: { total: number; used: number; remaining: number };
  casualLeave: { total: number; used: number; remaining: number };
}

export interface AssetAllocation {
  laptopSerial: string;
  monitorModel: string;
  accessCardId: string;
  workstationDesk: string;
  headset?: string;
  allocatedDate: string;
}

export interface User {
  id: string;
  employeeCode: string; // e.g. EMP-001, EMP-002, INT-021
  username: string;
  password?: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  jobTitle: string;
  avatarUrl: string;
  phone: string;
  joinedDate: string;
  status: AttendanceStatus;
  currentShiftStart?: string | null;
  lastClockOut?: string | null;
  lastKnownLocation?: LocationCoordinates | null;
  currentLocation?: LocationCoordinates | null;
  mentorId?: string | null;
  mentorName?: string | null;
  mentorRole?: string | null;
  mentorEmail?: string | null;
  managerName?: string;
  emergencyContact?: { name: string; phone: string; relation: string };
  assets?: AssetAllocation;
  leaveBalance?: LeaveBalance;
  skills?: string[];
  batteryLevel?: number;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  department: string;
  date: string; // YYYY-MM-DD
  clockInTime: string; // ISO
  clockOutTime?: string | null; // ISO
  durationMinutes?: number | null;
  clockInCoords: LocationCoordinates;
  clockOutCoords?: LocationCoordinates | null;
  notes?: string;
  deviceType?: string;
}

export interface RegularizationRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  type: 'REGULARIZATION' | 'LEAVE';
  date: string; // YYYY-MM-DD
  endDate?: string; // For multi-day leave
  proposedClockIn?: string;
  proposedClockOut?: string;
  leaveType?: 'CASUAL' | 'SICK' | 'PAID' | 'PRIVILEGE';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  managerNotes?: string;
  managerName?: string;
}

export interface InternLogbook {
  id: string;
  internId: string;
  internName: string;
  mentorId?: string;
  weekNumber: number;
  year: number;
  submissionDate: string;
  milestonesCompleted: string;
  tasksCompleted: string;
  learnings: string;
  blockers: string;
  status: 'UNDER_REVIEW' | 'APPROVED' | 'NEEDS_REVISION';
  mentorFeedback?: string;
  reviewedAt?: string;
}

export interface MetricStats {
  totalWorkforce: number;
  clockedInCount: number;
  activeInternsCount: number;
  onLeaveCount: number;
  departmentBreakdown: Record<string, number>;
  roleBreakdown: Record<string, number>;
}
