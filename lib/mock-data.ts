import { User, AttendanceRecord, InternLogbook, RegularizationRequest } from './types';

export const DEFAULT_CENTER = {
  lat: 17.448292,
  lng: 78.375638,
  city: "Mindspace Cyberabad, HITEC City, Hyderabad"
};

// Exact 30 staff members with Deepika Pillai as Head Admin
export const RAW_STAFF_DATA = [
  {
    id: "EMP-001",
    name: "Deepika Pillai",
    email: "deepika.p@workpulse.io",
    role: "ADMIN" as const,
    department: "Management",
    jobTitle: "Chief Executive & Operations Admin",
    phone: "+91 98480 12345",
    status: "CLOCKED_IN" as const,
    clockInTime: "2026-10-06T09:00:00Z",
    clockOutTime: null,
    lastKnownLocation: { lat: 17.448292, lng: 78.375638, address: "Mindspace Cyberabad, HITEC City" },
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-002",
    name: "Aarav Sharma",
    email: "aarav.sharma@workpulse.io",
    role: "EMPLOYEE" as const,
    department: "Engineering",
    jobTitle: "Lead Fullstack Engineer",
    phone: "+91 98765 43210",
    status: "CLOCKED_IN" as const,
    clockInTime: "2026-10-06T09:15:30Z",
    clockOutTime: null,
    lastKnownLocation: { lat: 17.443120, lng: 78.382100, address: "Madhapur Metro Hub, Hyderabad" },
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-003",
    name: "Kavya Reddy",
    email: "kavya.reddy@workpulse.io",
    role: "EMPLOYEE" as const,
    department: "Engineering",
    jobTitle: "Senior Backend Systems Architect",
    phone: "+91 98765 43211",
    status: "CLOCKED_IN" as const,
    clockInTime: "2026-10-06T08:55:10Z",
    clockOutTime: null,
    lastKnownLocation: { lat: 17.451200, lng: 78.369400, address: "Knowledge City, Raidurg" },
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-004",
    name: "Rohan Patel",
    email: "rohan.patel@workpulse.io",
    role: "EMPLOYEE" as const,
    department: "Product",
    jobTitle: "Principal Product Manager",
    phone: "+91 98765 43212",
    status: "CLOCKED_OUT" as const,
    clockInTime: "2026-10-06T08:30:00Z",
    clockOutTime: "2026-10-06T17:45:00Z",
    lastKnownLocation: { lat: 17.449100, lng: 78.373500, address: "Inorbit Mall Road, Madhapur" },
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-005",
    name: "Neha Gupta",
    email: "neha.gupta@workpulse.io",
    role: "EMPLOYEE" as const,
    department: "Design",
    jobTitle: "Design Director & UI/UX Lead",
    phone: "+91 98765 43213",
    status: "CLOCKED_IN" as const,
    clockInTime: "2026-10-06T09:30:00Z",
    clockOutTime: null,
    lastKnownLocation: { lat: 17.439800, lng: 78.374200, address: "Durgam Cheruvu View Point" },
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-006",
    name: "Vikram Rao",
    email: "vikram.rao@workpulse.io",
    role: "EMPLOYEE" as const,
    department: "Operations",
    jobTitle: "Operations Lead & Logistics",
    phone: "+91 98765 43214",
    status: "CLOCKED_OUT" as const,
    clockInTime: "2026-10-06T09:10:00Z",
    clockOutTime: "2026-10-06T18:00:00Z",
    lastKnownLocation: { lat: 17.452000, lng: 78.368000, address: "Bio-Diversity Junction, Gachibowli" },
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-007",
    name: "Pooja Nair",
    email: "pooja.nair@workpulse.io",
    role: "EMPLOYEE" as const,
    department: "Human Resources",
    jobTitle: "Senior People Operations Partner",
    phone: "+91 98765 43215",
    status: "CLOCKED_IN" as const,
    clockInTime: "2026-10-06T09:05:00Z",
    clockOutTime: null,
    lastKnownLocation: { lat: 17.447500, lng: 78.376200, address: "Cyber Towers, HITEC City" },
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-008",
    name: "Siddharth Iyer",
    email: "siddharth.iyer@workpulse.io",
    role: "EMPLOYEE" as const,
    department: "Engineering",
    jobTitle: "DevOps & Cloud SRE Lead",
    phone: "+91 98765 43216",
    status: "CLOCKED_IN" as const,
    clockInTime: "2026-10-06T08:45:00Z",
    clockOutTime: null,
    lastKnownLocation: { lat: 17.446200, lng: 78.380500, address: "Ayyappa Society, Madhapur" },
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-009",
    name: "Ananya Singh",
    email: "ananya.singh@workpulse.io",
    role: "EMPLOYEE" as const,
    department: "Marketing",
    jobTitle: "Growth & Brand Marketing Lead",
    phone: "+91 98765 43217",
    status: "CLOCKED_OUT" as const,
    clockInTime: "2026-10-06T09:20:00Z",
    clockOutTime: "2026-10-06T18:15:00Z",
    lastKnownLocation: { lat: 17.441000, lng: 78.385000, address: "Kavuri Hills, Jubilee Hills Extn" },
    avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-010",
    name: "Arjun Kumar",
    email: "arjun.kumar@workpulse.io",
    role: "EMPLOYEE" as const,
    department: "QA & Testing",
    jobTitle: "Staff Quality Assurance Engineer",
    phone: "+91 98765 43218",
    status: "CLOCKED_IN" as const,
    clockInTime: "2026-10-06T09:12:00Z",
    clockOutTime: null,
    lastKnownLocation: { lat: 17.450100, lng: 78.371800, address: "DLF Cybercity, Gachibowli" },
    avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-011",
    name: "Suresh Deshmukh",
    email: "suresh.d@workpulse.io",
    role: "EMPLOYEE" as const,
    department: "Engineering",
    jobTitle: "Frontend Platform Engineer",
    phone: "+91 98765 43219",
    status: "CLOCKED_IN" as const,
    clockInTime: "2026-10-06T09:00:20Z",
    clockOutTime: null,
    lastKnownLocation: { lat: 17.444800, lng: 78.378900, address: "Vittal Rao Nagar, Madhapur" },
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-012",
    name: "Revathi Pallapu",
    email: "revathi.p@workpulse.io",
    role: "EMPLOYEE" as const,
    department: "Product",
    jobTitle: "Senior Product Analyst",
    phone: "+91 98765 43220",
    status: "CLOCKED_OUT" as const,
    clockInTime: "2026-10-06T08:50:00Z",
    clockOutTime: "2026-10-06T17:30:00Z",
    lastKnownLocation: { lat: 17.438900, lng: 78.381200, address: "Silpa Gram Craft Village" },
    avatarUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-013",
    name: "Rahul Verma",
    email: "rahul.verma@workpulse.io",
    role: "EMPLOYEE" as const,
    department: "Engineering",
    jobTitle: "Senior Mobile Engineer (Flutter/React Native)",
    phone: "+91 98765 43221",
    status: "CLOCKED_IN" as const,
    clockInTime: "2026-10-06T09:25:00Z",
    clockOutTime: null,
    lastKnownLocation: { lat: 17.449500, lng: 78.376800, address: "Phoenix Avance, HITEC City" },
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-014",
    name: "Sneha Kulkarni",
    email: "sneha.k@workpulse.io",
    role: "EMPLOYEE" as const,
    department: "Design",
    jobTitle: "Product & Motion Designer",
    phone: "+91 98765 43222",
    status: "CLOCKED_IN" as const,
    clockInTime: "2026-10-06T09:10:45Z",
    clockOutTime: null,
    lastKnownLocation: { lat: 17.442500, lng: 78.373000, address: "Madhapur Police Station Road" },
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-015",
    name: "Manish Choudhury",
    email: "manish.c@workpulse.io",
    role: "EMPLOYEE" as const,
    department: "QA & Testing",
    jobTitle: "Automation & Security QA",
    phone: "+91 98765 43223",
    status: "CLOCKED_OUT" as const,
    clockInTime: "2026-10-06T08:40:00Z",
    clockOutTime: "2026-10-06T17:50:00Z",
    lastKnownLocation: { lat: 17.453500, lng: 78.366500, address: "IIIT Junction, Gachibowli" },
    avatarUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-016",
    name: "Meera Joshi",
    email: "meera.j@workpulse.io",
    role: "EMPLOYEE" as const,
    department: "Human Resources",
    jobTitle: "Talent Acquisition Specialist",
    phone: "+91 98765 43224",
    status: "CLOCKED_IN" as const,
    clockInTime: "2026-10-06T09:02:15Z",
    clockOutTime: null,
    lastKnownLocation: { lat: 17.447100, lng: 78.374800, address: "The Westin Mindspace Enclave" },
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-017",
    name: "Karthik Bhat",
    email: "karthik.b@workpulse.io",
    role: "EMPLOYEE" as const,
    department: "Engineering",
    jobTitle: "Distributed Systems Engineer",
    phone: "+91 98765 43225",
    status: "CLOCKED_IN" as const,
    clockInTime: "2026-10-06T08:58:00Z",
    clockOutTime: null,
    lastKnownLocation: { lat: 17.446900, lng: 78.377500, address: "Ascendas IT Park, HITEC City" },
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-018",
    name: "Divya Menon",
    email: "divya.m@workpulse.io",
    role: "EMPLOYEE" as const,
    department: "Marketing",
    jobTitle: "Content & Communications Manager",
    phone: "+91 98765 43226",
    status: "CLOCKED_OUT" as const,
    clockInTime: "2026-10-06T09:15:00Z",
    clockOutTime: "2026-10-06T18:05:00Z",
    lastKnownLocation: { lat: 17.440200, lng: 78.383500, address: "Jubilee Enclave Road" },
    avatarUrl: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-019",
    name: "Varun Chatterjee",
    email: "varun.c@workpulse.io",
    role: "EMPLOYEE" as const,
    department: "Operations",
    jobTitle: "Workforce Logistics & Facilities",
    phone: "+91 98765 43227",
    status: "CLOCKED_IN" as const,
    clockInTime: "2026-10-06T09:08:30Z",
    clockOutTime: null,
    lastKnownLocation: { lat: 17.451800, lng: 78.370500, address: "One West Building, Financial Dist Rd" },
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "EMP-020",
    name: "Anjali Das",
    email: "anjali.das@workpulse.io",
    role: "ADMIN" as const,
    department: "Human Resources",
    jobTitle: "Director of HR Operations",
    phone: "+91 98765 43228",
    status: "CLOCKED_IN" as const,
    clockInTime: "2026-10-06T08:50:00Z",
    clockOutTime: null,
    lastKnownLocation: { lat: 17.448000, lng: 78.376000, address: "Mindspace Building 3" },
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "INT-021",
    name: "Diya Choudhury",
    email: "diya.c@workpulse.io",
    role: "INTERN" as const,
    department: "Engineering",
    jobTitle: "Software Engineering Intern",
    phone: "+91 98765 43229",
    mentor: "Aarav Sharma (EMP-002)",
    status: "CLOCKED_IN" as const,
    clockInTime: "2026-10-06T09:05:00Z",
    clockOutTime: null,
    lastKnownLocation: { lat: 17.445500, lng: 78.378900, address: "Madhapur Tech Zone" },
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "INT-022",
    name: "Reyansh Mehta",
    email: "reyansh.m@workpulse.io",
    role: "INTERN" as const,
    department: "Engineering",
    jobTitle: "Fullstack Engineering Intern",
    phone: "+91 98765 43230",
    mentor: "Kavya Reddy (EMP-003)",
    status: "CLOCKED_OUT" as const,
    clockInTime: "2026-10-06T09:00:00Z",
    clockOutTime: "2026-10-06T17:30:00Z",
    lastKnownLocation: { lat: 17.443500, lng: 78.381200, address: "Hitec City Station Road" },
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "INT-023",
    name: "Tanvi Joshi",
    email: "tanvi.j@workpulse.io",
    role: "INTERN" as const,
    department: "Design",
    jobTitle: "UI/UX Design Intern",
    phone: "+91 98765 43231",
    mentor: "Neha Gupta (EMP-005)",
    status: "CLOCKED_IN" as const,
    clockInTime: "2026-10-06T09:35:10Z",
    clockOutTime: null,
    lastKnownLocation: { lat: 17.440500, lng: 78.375500, address: "Durgam Cheruvu Cable Bridge" },
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "INT-024",
    name: "Chirag Bhat",
    email: "chirag.b@workpulse.io",
    role: "INTERN" as const,
    department: "QA & Testing",
    jobTitle: "QA & Automation Intern",
    phone: "+91 98765 43232",
    mentor: "Arjun Kumar (EMP-010)",
    status: "CLOCKED_IN" as const,
    clockInTime: "2026-10-06T09:14:00Z",
    clockOutTime: null,
    lastKnownLocation: { lat: 17.449800, lng: 78.372500, address: "Tech Mahindra Road, Madhapur" },
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "INT-025",
    name: "Priyanka Mishra",
    email: "priyanka.m@workpulse.io",
    role: "INTERN" as const,
    department: "Marketing",
    jobTitle: "Growth & Social Marketing Intern",
    phone: "+91 98765 43233",
    mentor: "Ananya Singh (EMP-009)",
    status: "CLOCKED_OUT" as const,
    clockInTime: "2026-10-06T09:10:00Z",
    clockOutTime: "2026-10-06T17:15:00Z",
    lastKnownLocation: { lat: 17.441800, lng: 78.384200, address: "Road No 36, Jubilee Hills" },
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "INT-026",
    name: "Tarun Saxena",
    email: "tarun.s@workpulse.io",
    role: "INTERN" as const,
    department: "Engineering",
    jobTitle: "Cloud Infrastructure Intern",
    phone: "+91 98765 43234",
    mentor: "Suresh Deshmukh (EMP-011)",
    status: "CLOCKED_IN" as const,
    clockInTime: "2026-10-06T08:52:00Z",
    clockOutTime: null,
    lastKnownLocation: { lat: 17.444200, lng: 78.379800, address: "Cyber Pearl Campus, HITEC City" },
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "INT-027",
    name: "Swathi Balan",
    email: "swathi.b@workpulse.io",
    role: "INTERN" as const,
    department: "Product",
    jobTitle: "Product Operations Intern",
    phone: "+91 98765 43235",
    mentor: "Rohan Patel (EMP-004)",
    status: "CLOCKED_IN" as const,
    clockInTime: "2026-10-06T09:20:40Z",
    clockOutTime: null,
    lastKnownLocation: { lat: 17.448800, lng: 78.374500, address: "Mindspace Roundabout" },
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "INT-028",
    name: "Naveen Tiwari",
    email: "naveen.t@workpulse.io",
    role: "INTERN" as const,
    department: "Engineering",
    jobTitle: "Backend Systems Intern",
    phone: "+91 98765 43236",
    mentor: "Rahul Verma (EMP-013)",
    status: "CLOCKED_OUT" as const,
    clockInTime: "2026-10-06T08:45:00Z",
    clockOutTime: "2026-10-06T17:00:00Z",
    lastKnownLocation: { lat: 17.451000, lng: 78.367000, address: "Gachibowli Flyover" },
    avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "INT-029",
    name: "Keerthi Nambiar",
    email: "keerthi.n@workpulse.io",
    role: "INTERN" as const,
    department: "Human Resources",
    jobTitle: "People Operations Intern",
    phone: "+91 98765 43237",
    mentor: "Pooja Nair (EMP-007)",
    status: "CLOCKED_IN" as const,
    clockInTime: "2026-10-06T09:01:10Z",
    clockOutTime: null,
    lastKnownLocation: { lat: 17.447200, lng: 78.375800, address: "Mindspace Gate 2" },
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80"
  },
  {
    id: "INT-030",
    name: "Harish Pandey",
    email: "harish.p@workpulse.io",
    role: "INTERN" as const,
    department: "Operations",
    jobTitle: "Operations & Facilities Intern",
    phone: "+91 98765 43238",
    mentor: "Vikram Rao (EMP-006)",
    status: "CLOCKED_IN" as const,
    clockInTime: "2026-10-06T09:18:25Z",
    clockOutTime: null,
    lastKnownLocation: { lat: 17.452800, lng: 78.369000, address: "Old Mumbai Highway, Gachibowli" },
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80"
  }
];

export function generateSyntheticHRMData(): { 
  users: User[]; 
  attendanceRecords: AttendanceRecord[]; 
  logbooks: InternLogbook[];
  regularizationRequests: RegularizationRequest[];
} {
  const users: User[] = RAW_STAFF_DATA.map((staff, index) => {
    const firstName = staff.name.split(' ')[0].toLowerCase();
    const username = staff.email.split('@')[0];
    const isClockedIn = staff.status === 'CLOCKED_IN';

    // Parse mentor details if available
    let mentorName: string | undefined;
    let mentorId: string | undefined;
    let mentorRole: string | undefined;
    let mentorEmail: string | undefined;

    if ('mentor' in staff && staff.mentor) {
      mentorName = (staff as any).mentor.split(' (')[0];
      const matchId = (staff as any).mentor.match(/\((.*?)\)/);
      if (matchId) mentorId = matchId[1];
      const mentorObj = RAW_STAFF_DATA.find(s => s.id === mentorId);
      if (mentorObj) {
        mentorRole = mentorObj.department;
        mentorEmail = mentorObj.email;
      } else {
        mentorRole = "Senior Mentor";
        mentorEmail = `${firstName}.mentor@workpulse.io`;
      }
    }

    const isManagement = staff.role === 'ADMIN';

    return {
      id: staff.id,
      employeeCode: staff.id,
      username: username,
      password: firstName,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      department: staff.department,
      jobTitle: staff.jobTitle,
      avatarUrl: staff.avatarUrl,
      phone: staff.phone,
      joinedDate: "2025-06-01",
      status: staff.status,
      currentShiftStart: staff.clockInTime,
      lastClockOut: staff.clockOutTime,
      currentLocation: isClockedIn ? { ...staff.lastKnownLocation, accuracy: 8, updatedAt: new Date().toISOString() } : null,
      lastKnownLocation: staff.lastKnownLocation ? { ...staff.lastKnownLocation, accuracy: 8 } : null,
      mentorId,
      mentorName,
      mentorRole,
      mentorEmail,
      managerName: isManagement ? "Board of Directors" : "Deepika Pillai (Chief Operations Admin)",
      emergencyContact: {
        name: `${staff.name.split(' ')[0]}'s Family Contact`,
        phone: "+91 98450 " + (10000 + index * 137).toString().slice(0, 5),
        relation: "Immediate Kin"
      },
      assets: {
        laptopSerial: `MBP-M3-${staff.id}-2025`,
        monitorModel: 'Dell UltraSharp 27" 4K USB-C',
        accessCardId: `WP-RFID-${staff.id.replace('-', '')}`,
        workstationDesk: `Cyberabad Tower 3, Floor 4, Bay ${staff.id.replace('EMP-', 'E').replace('INT-', 'I')}`,
        headset: 'Jabra Evolve2 65 Bluetooth',
        allocatedDate: '2025-06-01'
      },
      leaveBalance: {
        annualLeave: { total: 18, used: 4, remaining: 14 },
        sickLeave: { total: 10, used: 2, remaining: 8 },
        casualLeave: { total: 7, used: 2, remaining: 5 }
      },
      skills: ["Enterprise Systems", "HRM Geolocation", "Team Collaboration"],
      batteryLevel: 92
    };
  });

  // Generate verified historical Attendance Records across past 30 days for rich monthly calendar analytics
  const attendanceRecords: AttendanceRecord[] = [];
  
  // Today's records (Oct 6, 2026)
  RAW_STAFF_DATA.forEach((staff, index) => {
    const isClockedIn = staff.status === 'CLOCKED_IN';
    const clockIn = new Date(staff.clockInTime);
    const clockOut = staff.clockOutTime ? new Date(staff.clockOutTime) : null;
    const durationMinutes = clockOut ? Math.round((clockOut.getTime() - clockIn.getTime()) / 60000) : Math.round((Date.now() - clockIn.getTime()) / 60000);

    attendanceRecords.push({
      id: `rec-2026-10-06-${staff.id}`,
      userId: staff.id,
      userName: staff.name,
      userRole: staff.role,
      department: staff.department,
      date: "2026-10-06",
      clockInTime: staff.clockInTime,
      clockOutTime: staff.clockOutTime,
      durationMinutes,
      clockInCoords: {
        ...staff.lastKnownLocation,
        accuracy: 8,
        recordedAt: staff.clockInTime,
      },
      clockOutCoords: staff.clockOutTime ? {
        ...staff.lastKnownLocation,
        accuracy: 8,
        recordedAt: staff.clockOutTime,
      } : null,
      notes: isClockedIn ? "Standard daily shift" : "Shift completed & signed off",
      deviceType: "WorkPulse Verified Web/Mobile",
    });
  });

  // Historical records for days 1 to 5 of October 2026 (for each staff member)
  const pastDays = [
    { day: 5, date: "2026-10-05", inHour: 9, inMin: 5, outHour: 18, outMin: 10 },
    { day: 4, date: "2026-10-04", inHour: 9, inMin: 45, outHour: 18, outMin: 30 }, // Late arrival
    { day: 3, date: "2026-10-03", inHour: 9, inMin: 0, outHour: 17, outMin: 45 },
    { day: 2, date: "2026-10-02", inHour: 9, inMin: 12, outHour: 18, outMin: 0 },
    { day: 1, date: "2026-10-01", inHour: 8, inMin: 58, outHour: 17, outMin: 50 },
  ];

  RAW_STAFF_DATA.forEach((staff) => {
    pastDays.forEach((p) => {
      const clockInTime = `${p.date}T0${p.inHour}:${p.inMin.toString().padStart(2, '0')}:00Z`;
      const clockOutTime = `${p.date}T${p.outHour}:${p.outMin.toString().padStart(2, '0')}:00Z`;
      const durationMinutes = (p.outHour - p.inHour) * 60 + (p.outMin - p.inMin);

      attendanceRecords.push({
        id: `rec-${p.date}-${staff.id}`,
        userId: staff.id,
        userName: staff.name,
        userRole: staff.role,
        department: staff.department,
        date: p.date,
        clockInTime,
        clockOutTime,
        durationMinutes,
        clockInCoords: {
          ...staff.lastKnownLocation,
          accuracy: 6,
          recordedAt: clockInTime,
        },
        clockOutCoords: {
          ...staff.lastKnownLocation,
          accuracy: 6,
          recordedAt: clockOutTime,
        },
        notes: p.inMin > 30 ? "Late arrival (Traffic on Outer Ring Road)" : "Punctual regular shift",
        deviceType: "WorkPulse Verified Terminal",
      });
    });
  });

  // Sample Regularization & Leave Requests
  const sampleRegularizations: RegularizationRequest[] = [
    {
      id: "reg-001",
      userId: "EMP-002",
      userName: "Aarav Sharma",
      userRole: "EMPLOYEE",
      type: "REGULARIZATION",
      date: "2026-10-04",
      proposedClockIn: "09:00",
      proposedClockOut: "18:00",
      reason: "Hardware GPS sync timeout during biometric check-in at Cyberabad office gate.",
      status: "APPROVED",
      submittedAt: "2026-10-04T19:00:00Z",
      managerNotes: "Approved - Verified security gate badge entry time.",
      managerName: "Deepika Pillai"
    },
    {
      id: "reg-002",
      userId: "EMP-003",
      userName: "Kavya Reddy",
      userRole: "EMPLOYEE",
      type: "LEAVE",
      date: "2026-10-09",
      endDate: "2026-10-10",
      leaveType: "CASUAL",
      reason: "Family personal commitment in Bengaluru.",
      status: "PENDING",
      submittedAt: "2026-10-06T10:30:00Z",
      managerName: "Deepika Pillai"
    }
  ];

  // Generate structured Intern Logbooks
  const logbooks: InternLogbook[] = [
    {
      id: "log-021-w42",
      internId: "INT-021",
      internName: "Diya Choudhury",
      mentorId: "EMP-002",
      weekNumber: 42,
      year: 2026,
      submissionDate: "2026-10-06T11:30:00Z",
      milestonesCompleted: "Implemented Leaflet OpenStreetMap bi-directional flyTo markers and hover syncing.",
      tasksCompleted: "1. Built React-Leaflet radar pulse wrapper\n2. Fixed Next.js hydration with dynamic ssr:false\n3. Integrated staff list sync",
      learnings: "Mastered geospatial coordinate handling and client-side map rendering lifecycle in Next.js App Router.",
      blockers: "None. Successfully reviewed with Aarav Sharma.",
      status: "APPROVED",
      mentorFeedback: "Outstanding execution Diya! The map interactions feel very snappy.",
      reviewedAt: "2026-10-06T14:00:00Z",
    },
    {
      id: "log-023-w42",
      internId: "INT-023",
      internName: "Tanvi Joshi",
      mentorId: "EMP-005",
      weekNumber: 42,
      year: 2026,
      submissionDate: "2026-10-06T10:15:00Z",
      milestonesCompleted: "Crafted Linear/Rippling design tokens, micro-animations, and responsive layouts.",
      tasksCompleted: "1. Defined Slate 50 / Indigo 600 color system\n2. Designed status badges with emerald pulse rings\n3. Refactored typography to Plus Jakarta Sans",
      learnings: "High-contrast enterprise UX principles and micro-interaction states.",
      blockers: "Waiting on final feedback for dark mode toggle tokens.",
      status: "UNDER_REVIEW",
    }
  ];

  return { users, attendanceRecords, logbooks, regularizationRequests: sampleRegularizations };
}
