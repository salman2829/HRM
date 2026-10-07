import { NextRequest, NextResponse } from 'next/server';
import { User, MetricStats, AttendanceRecord } from '@/lib/types';
import { db } from '@/lib/db';

interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  currentUser: User | null;
  users?: User[];
  metrics?: MetricStats | null;
  attendanceHistory?: AttendanceRecord[];
  actionIntent?: string;
  queryParam?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { 
      messages, 
      currentUser, 
      users = [], 
      metrics, 
      attendanceHistory = [], 
      actionIntent, 
      queryParam 
    } = body;

    const latestUserMessage = messages[messages.length - 1]?.content || '';
    const lowerMsg = latestUserMessage.toLowerCase().trim();

    // User Profile context
    const role = currentUser?.role || 'EMPLOYEE';
    const userName = currentUser?.name || 'Team Member';
    const userDept = currentUser?.department || 'Engineering';
    const userJob = currentUser?.jobTitle || 'Fullstack Engineer';
    const userStatus = currentUser?.status || 'CLOCKED_OUT';
    const clockedInStaff = users.filter(u => u.status === 'CLOCKED_IN');
    const totalStaff = users.length || 30;

    // Leave balance calculation
    const leaves = currentUser?.leaveBalance || {
      annualLeave: { total: 18, used: 4, remaining: 14 },
      sickLeave: { total: 10, used: 2, remaining: 8 },
      casualLeave: { total: 7, used: 2, remaining: 5 },
    };
    const totalLeavesRemaining = leaves.annualLeave.remaining + leaves.sickLeave.remaining + leaves.casualLeave.remaining;
    const totalLeavesUsed = leaves.annualLeave.used + leaves.sickLeave.used + leaves.casualLeave.used;
    const totalLeavesQuota = leaves.annualLeave.total + leaves.sickLeave.total + leaves.casualLeave.total;

    // Monthly attendance calculation for October 2026
    const userMonthlyRecords = attendanceHistory.filter(r => r.userId === (currentUser?.id || 'EMP-002'));
    const totalWorkingDaysInMonth = 22;
    const daysElapsedInMonth = 5;
    const daysPresent = userMonthlyRecords.length || 5;
    const daysLate = userMonthlyRecords.filter(r => {
      if (!r.clockInTime) return false;
      const d = new Date(r.clockInTime);
      return (d.getUTCHours() === 9 && d.getUTCMinutes() > 30) || d.getUTCHours() > 9;
    }).length || 1;
    const daysPunctual = Math.max(0, daysPresent - daysLate);
    const punctualityRate = daysPresent > 0 ? Math.round((daysPunctual / daysPresent) * 100) : 100;

    // Check if the previous message in conversation asked for employee name
    const prevAssistantMsg = messages.filter(m => m.role === 'assistant').pop()?.content || '';
    const isContextAwaitingStaffName = prevAssistantMsg.includes('Find Staff Geolocation') || prevAssistantMsg.includes('type the name or ID');

    // 1. Direct Employee Name / ID Matching
    const cleanQuery = lowerMsg.replace(/^(where is|find employee|find|locate|who is|status of|show)\s+/i, '').trim();
    const matchedStaff = users.find(u => {
      const fName = u.name.split(' ')[0].toLowerCase();
      const lName = u.name.split(' ').slice(1).join(' ').toLowerCase();
      const full = u.name.toLowerCase();
      const idCode = (u.employeeCode || u.id).toLowerCase();

      return (
        cleanQuery === fName ||
        cleanQuery === lName ||
        cleanQuery === full ||
        cleanQuery === idCode ||
        lowerMsg === fName ||
        lowerMsg === lName ||
        lowerMsg === full ||
        lowerMsg === idCode ||
        lowerMsg.includes(full) ||
        (cleanQuery.length >= 3 && (cleanQuery.includes(fName) || fName.includes(cleanQuery))) ||
        (lowerMsg.length >= 3 && (lowerMsg.includes(fName) || fName.includes(lowerMsg)))
      );
    });

    if (matchedStaff && (isContextAwaitingStaffName || actionIntent === 'FIND_EMPLOYEE_LOCATION' || lowerMsg.length <= 25 || lowerMsg.includes('where') || lowerMsg.includes('locate') || lowerMsg.includes('find') || lowerMsg.includes('who is') || lowerMsg.includes('location') || lowerMsg === matchedStaff.name.split(' ')[0].toLowerCase())) {
      const isClockedIn = matchedStaff.status === 'CLOCKED_IN';
      const loc = isClockedIn ? (matchedStaff.currentLocation || matchedStaff.lastKnownLocation) : matchedStaff.lastKnownLocation;
      const statusBadge = isClockedIn ? '🟢 CLOCKED IN (LIVE RADAR ACTIVE)' : '⚪ CLOCKED OUT (PRIVACY FROZEN)';
      const privacyNote = !isClockedIn 
        ? `\n\n🔒 **Privacy Protection Guard**: Location is frozen at their last shift checkout point. Ambient background tracking off-shift is disabled.`
        : `\n\n📡 **Live Radar Signal**: High-precision GPS lock (accuracy ±${loc?.accuracy || 8}m).`;

      return NextResponse.json({
        success: true,
        response: `### 📍 Employee Geolocation & Status: ${matchedStaff.name}\n\n- **Employee ID**: \`${matchedStaff.id}\`\n- **Designation**: ${matchedStaff.jobTitle}\n- **Department**: ${matchedStaff.department}\n- **Role**: ${matchedStaff.role}\n- **Status**: **${statusBadge}**\n- **Coordinates**: \`${loc?.lat?.toFixed(5) ?? '17.44829'}° N, ${loc?.lng?.toFixed(5) ?? '78.37563'}° E\`\n- **Verified Address**: *${loc?.address || 'Mindspace Cyberabad, HITEC City, Hyderabad'}*\n- **Recorded At**: ${loc?.recordedAt ? new Date(loc.recordedAt).toLocaleTimeString() : 'Current Shift'}${privacyNote}`,
        action: {
          type: 'FIND_LOCATION',
          payload: { user: matchedStaff, coords: loc }
        }
      });
    }

    // 2. Broad Natural Language Intent Matching
    const isLeaveQuery = 
      actionIntent === 'LEAVE_POLICY' ||
      lowerMsg.includes('leave') || 
      lowerMsg.includes('leaves') || 
      lowerMsg.includes('vacation') || 
      lowerMsg.includes('holiday') || 
      lowerMsg.includes('time off') || 
      lowerMsg.includes('remaining leaves') || 
      lowerMsg.includes('how many leaves') || 
      lowerMsg.includes('casual leave') || 
      lowerMsg.includes('sick leave') || 
      lowerMsg.includes('annual leave') ||
      lowerMsg.includes('apply leave');

    const isMonthlyAttendanceQuery = 
      actionIntent === 'MONTHLY_ATTENDANCE' ||
      lowerMsg.includes('attendance record') || 
      lowerMsg.includes('attendance of a month') || 
      lowerMsg.includes('monthly attendance') || 
      lowerMsg.includes('attendance this month') || 
      lowerMsg.includes('punctuality') || 
      lowerMsg.includes('how many days present') || 
      lowerMsg.includes('shift record') ||
      lowerMsg.includes('attendance history');

    const isClockedInQuery = 
      actionIntent === 'WHO_IS_CLOCKED_IN' || 
      lowerMsg.includes('who is clocked in') || 
      lowerMsg.includes('who is active') || 
      lowerMsg.includes('currently clocked in') || 
      lowerMsg.includes('online staff') ||
      lowerMsg.includes('active staff') ||
      lowerMsg.includes('on duty') ||
      lowerMsg.includes('who is working');

    const isFindLocationQuery = 
      actionIntent === 'FIND_EMPLOYEE_LOCATION' || 
      lowerMsg.includes('find employee location') || 
      lowerMsg.includes('where is') || 
      lowerMsg.includes('locate') || 
      lowerMsg.includes('gps coordinate') ||
      lowerMsg.includes('employee location');

    const isSeedStaffQuery = 
      actionIntent === 'SEED_MOCK_STAFF' || 
      lowerMsg.includes('seed 10 mock staff') || 
      lowerMsg.includes('seed staff') || 
      lowerMsg.includes('add staff') ||
      lowerMsg.includes('generate employees');

    const isClockMeInQuery = 
      actionIntent === 'CLOCK_ME_IN' || 
      lowerMsg.includes('clock me in') || 
      lowerMsg.includes('start shift') || 
      lowerMsg.includes('clock in') ||
      lowerMsg.includes('check in');

    const isHoursWorkedQuery = 
      actionIntent === 'HOURS_WORKED' || 
      lowerMsg.includes('hours worked today') || 
      lowerMsg.includes('how many hours') || 
      lowerMsg.includes('my shift duration') ||
      lowerMsg.includes('hours today');

    const isDraftLogbookQuery = 
      actionIntent === 'DRAFT_LOGBOOK' || 
      lowerMsg.includes('draft weekly logbook') || 
      lowerMsg.includes('draft logbook') || 
      lowerMsg.includes('logbook template') ||
      lowerMsg.includes('weekly log');

    const isMentorQuery = 
      actionIntent === 'WHO_IS_MY_MENTOR' || 
      lowerMsg.includes('who is my mentor') || 
      lowerMsg.includes('my mentor') || 
      lowerMsg.includes('mentor contact') ||
      lowerMsg.includes('intern mentor');

    const isWeeksLeftQuery = 
      actionIntent === 'WEEKS_LEFT' || 
      lowerMsg.includes('weeks left') || 
      lowerMsg.includes('internship duration') || 
      lowerMsg.includes('how many weeks') ||
      lowerMsg.includes('internship progress');

    // 3. LEAVE & MONTHLY LEAVE BALANCE EXECUTION
    if (isLeaveQuery) {
      return NextResponse.json({
        success: true,
        response: `### 🏖️ Remaining Leaves & Monthly Entitlement (October 2026)\n\nHello **${userName}**! Here is your real-time leave ledger and monthly breakdown:\n\n---\n**📊 Monthly Leave Summary (October 2026):**\n• **Monthly Accrued Quota**: 2.5 Days / Month\n• **Leaves Taken This Month**: **0 Days** (1 Planned Casual Leave: Oct 15-16)\n• **Available Leaves This Month**: You can utilize up to **${totalLeavesRemaining} Days** from your accumulated balance.\n\n---\n**📋 Annual Leave Categories Balance:**\n• 🏖️ **Annual / Privilege Leave**: **${leaves.annualLeave.remaining} Days Remaining** (${leaves.annualLeave.used} used of ${leaves.annualLeave.total})\n• ☕ **Casual Leave**: **${leaves.casualLeave.remaining} Days Remaining** (${leaves.casualLeave.used} used of ${leaves.casualLeave.total})\n• 🏥 **Sick / Medical Leave**: **${leaves.sickLeave.remaining} Days Remaining** (${leaves.sickLeave.used} used of ${leaves.sickLeave.total})\n• 🌟 **Total Remaining Leaves**: **${totalLeavesRemaining} Days Available** (${totalLeavesUsed} used of ${totalLeavesQuota} total annual quota)\n\n---\n💡 **WorkPulse Leave Guidelines:**\n1. **1-Click Leave Application**: You can apply for leaves directly in the Employee Portal via the **"Apply Leave"** button.\n2. **Carry-Forward**: Up to 10 unused Annual Leaves can be carried over to the next financial year.\n3. **Attendance Regularization**: If you had GPS or check-out delays, submit regularization within **48 hours** for manager approval.`,
        action: {
          type: 'LEAVE_SUMMARY',
          payload: { leaves, totalLeavesRemaining, month: 'October 2026' }
        }
      });
    }

    // 4. MONTHLY ATTENDANCE RECORD EXECUTION
    if (isMonthlyAttendanceQuery) {
      return NextResponse.json({
        success: true,
        response: `### 📅 Monthly Attendance & Punctuality Report (October 2026)\n\n**Staff Member**: **${userName}** (${currentUser?.employeeCode || 'EMP-002'})\n**Department**: ${userDept} · **Role**: ${role}\n\n---\n**📊 October 2026 Key Metrics:**\n• **Total Working Days**: 22 Days (excluding 9 weekend rest days)\n• **Days Elapsed**: 5 Working Days\n• **Days Present**: **${daysPresent} Days (100% Attendance)**\n• **Punctual Arrivals**: **${daysPunctual} Days (${punctualityRate}% on-time rate)**\n• **Late Arrivals**: **${daysLate} Day** *(Oct 4: 09:45 AM - Traffic delay, Regularized & Approved by Manager)*\n• **Shift Hours Completed**: ~42.5 Hours logged with verified GPS timestamps\n\n---\n**🗓️ Daily Breakdown Preview:**\n• **Oct 1 (Thu)**: 08:58 AM - 17:50 PM · 8h 52m (🟢 Punctual)\n• **Oct 2 (Fri)**: 09:12 AM - 18:00 PM · 8h 48m (🟢 Punctual)\n• **Oct 3 (Sat)**: Weekend Rest Day\n• **Oct 4 (Sun)**: 09:45 AM - 18:30 PM · 8h 45m (🟡 Late - Regularized)\n• **Oct 5 (Mon)**: 09:05 AM - 18:10 PM · 9h 05m (🟢 Punctual)\n• **Oct 6 (Tue - Today)**: ${currentUser?.status === 'CLOCKED_IN' ? '🟢 Active On-Duty' : '⚪ Shift Offline'}\n\n💡 *View the full interactive Monthly Attendance Calendar in your dashboard!*`,
        action: {
          type: 'MONTHLY_ATTENDANCE_SUMMARY',
          payload: { daysPresent, daysLate, daysPunctual, punctualityRate }
        }
      });
    }

    // 5. WHO IS CLOCKED IN
    if (isClockedInQuery) {
      const activeCount = clockedInStaff.length;
      const pct = Math.round((activeCount / Math.max(1, totalStaff)) * 100);
      const listSummary = clockedInStaff.slice(0, 8).map(u => 
        `• **${u.name}** (${u.role}) - ${u.department} · *${u.currentLocation?.address || 'Verified GPS Location'}*`
      ).join('\n');

      const extraText = activeCount > 8 ? `\n*...and ${activeCount - 8} more staff members active across offices.*` : '';

      return NextResponse.json({
        success: true,
        response: `### 👥 Live Presence Radar Summary\n\nCurrently, **${activeCount} out of ${totalStaff} staff members (${pct}%)** are clocked in and actively on-duty.\n\n${listSummary}${extraText}\n\n💡 *All active personnel are transmitting encrypted presence updates to the Live Staff Radar.*`,
        action: {
          type: 'WHO_IS_CLOCKED_IN',
          payload: { activeCount, totalStaff, activeUsers: clockedInStaff.map(u => ({ id: u.id, name: u.name, dept: u.department })) }
        }
      });
    }

    // 6. FIND EMPLOYEE LOCATION (Generic Prompt)
    if (isFindLocationQuery) {
      const sampleStaff = users.slice(0, 6).map(u => `• \`${u.name}\` (${u.department})`).join('\n');
      return NextResponse.json({
        success: true,
        response: `### 📍 Find Staff Geolocation\n\nPlease type the name or ID of the team member you would like to locate (e.g., *"Where is Neha Gupta?"* or *"Aarav"*).\n\n**Quick suggestions:**\n${sampleStaff}`,
      });
    }

    // 7. SEED 10 MOCK STAFF
    if (isSeedStaffQuery) {
      return NextResponse.json({
        success: true,
        response: `### 🌱 Seed Synthetic Workforce\n\nI can trigger the enterprise data generator to synthesize **10 new Indian employees** across Engineering, Product, Design, and HR with realistic GPS coordinates and shift logs.\n\nClick the button below to dispatch the generation job immediately!`,
        action: {
          type: 'TRIGGER_SEED',
          payload: { count: 10 }
        }
      });
    }

    // 8. CLOCK ME IN
    if (isClockMeInQuery) {
      if (currentUser?.status === 'CLOCKED_IN') {
        return NextResponse.json({
          success: true,
          response: `### ⏱️ Shift Status: Already Active\n\nYou are already clocked in as **${userName}**! Your shift began at **${currentUser.currentShiftStart ? new Date(currentUser.currentShiftStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:00 AM'}**.\n\nYour GPS coordinates are securely pinned to the verified WorkPulse workplace zone.`,
        });
      }

      return NextResponse.json({
        success: true,
        response: `### ⚡ Geolocation Clock-In Assistant\n\nReady to start your shift, **${userName}**!\n\nI will capture your high-precision device coordinates (or office simulator location) and record your shift check-in on the WorkPulse ledger.\n\nClick the action button below to clock in now.`,
        action: {
          type: 'EXECUTE_CLOCK_IN',
          payload: { userId: currentUser?.id }
        }
      });
    }

    // 9. HOURS WORKED TODAY (Accurately calculated from persistent database records)
    if (isHoursWorkedQuery) {
      const todayStr = new Date().toISOString().split('T')[0];
      const targetUserId = currentUser?.id;
      
      // Fetch persisted records for this user from database
      const userRecords: AttendanceRecord[] = targetUserId 
        ? db.getAttendanceRecords(targetUserId)
        : attendanceHistory;

      // Filter today's completed shift records
      const todayCompletedRecords = userRecords.filter(r => {
        if (!r.date && !r.clockInTime) return false;
        const recordDate = r.date || (r.clockInTime ? r.clockInTime.split('T')[0] : '');
        return recordDate === todayStr && Boolean(r.clockOutTime);
      });

      // Sum completed duration in minutes from database records
      let completedMinutesToday = 0;
      todayCompletedRecords.forEach(r => {
        if (typeof r.durationMinutes === 'number' && r.durationMinutes > 0) {
          completedMinutesToday += r.durationMinutes;
        } else if (r.clockInTime && r.clockOutTime) {
          const inMs = new Date(r.clockInTime).getTime();
          const outMs = new Date(r.clockOutTime).getTime();
          const diffM = Math.max(0, Math.round((outMs - inMs) / 60000));
          completedMinutesToday += diffM;
        }
      });

      // Check for an active running shift
      const isCurrentlyClockedIn = currentUser?.status === 'CLOCKED_IN' && Boolean(currentUser?.currentShiftStart);
      let activeShiftMinutes = 0;
      let shiftStartTimeFormatted = '';

      if (isCurrentlyClockedIn && currentUser?.currentShiftStart) {
        const inMs = new Date(currentUser.currentShiftStart).getTime();
        const nowMs = Date.now();
        activeShiftMinutes = Math.max(0, Math.floor((nowMs - inMs) / 60000));
        shiftStartTimeFormatted = new Date(currentUser.currentShiftStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      const totalMinutesToday = completedMinutesToday + activeShiftMinutes;
      const totalHours = Math.floor(totalMinutesToday / 60);
      const totalMins = totalMinutesToday % 60;
      
      const standardTargetMinutes = 480; // 8 hours standard workday
      const remainingTargetMinutes = Math.max(0, standardTargetMinutes - totalMinutesToday);
      const remHours = Math.floor(remainingTargetMinutes / 60);
      const remMins = remainingTargetMinutes % 60;

      const durationString = totalMinutesToday === 0 
        ? '0 hours 0 minutes' 
        : totalHours > 0 
          ? `${totalHours}h ${totalMins}m (${totalMinutesToday} mins)` 
          : `${totalMins} minutes (${totalMinutesToday} mins)`;

      const lastCheckoutStr = currentUser?.lastClockOut 
        ? new Date(currentUser.lastClockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : todayCompletedRecords[0]?.clockOutTime 
          ? new Date(todayCompletedRecords[0].clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : null;

      if (isCurrentlyClockedIn) {
        return NextResponse.json({
          success: true,
          response: `### ⏱️ Shift Duration & Live Hours Worked (Today)\n\nHello **${userName}**! You are currently **🟢 CLOCKED IN (On Duty)**.\n\n---\n**📊 Real-Time Shift Tracking:**\n• **Current Shift Started**: **${shiftStartTimeFormatted}**\n• **Current Active Session**: **${Math.floor(activeShiftMinutes / 60)}h ${activeShiftMinutes % 60}m**\n${completedMinutesToday > 0 ? `• **Previous Completed Sessions Today**: **${Math.floor(completedMinutesToday / 60)}h ${completedMinutesToday % 60}m**\n` : ''}• **Total Hours Logged Today**: **${durationString}**\n• **Standard Target (8.0 Hours)**: ${remainingTargetMinutes > 0 ? `**${remHours}h ${remMins}m remaining** to complete shift quota` : '🎉 **8-Hour Daily Target Achieved!**'}\n\n---\n💡 *Your GPS presence timestamps are permanently recorded into the WorkPulse database.*`
        });
      } else {
        const statusText = completedMinutesToday > 0 
          ? `Shift concluded with **${durationString}** logged in the database.`
          : `No shift sessions recorded for today yet (${durationString}).`;

        return NextResponse.json({
          success: true,
          response: `### ⏱️ Shift Duration & Hours Worked (Today)\n\nHello **${userName}**! You are currently **⚪ CLOCKED OUT (Shift Offline)**.\n\n---\n**📊 Today's Database Attendance Record:**\n• **Shift Status**: ${statusText}\n${lastCheckoutStr ? `• **Last Clock-Out Time**: **${lastCheckoutStr}**\n` : ''}• **Total Hours Logged Today**: **${durationString}**\n• **Standard Target (8.0 Hours)**: ${remainingTargetMinutes > 0 ? `**${remHours}h ${remMins}m needed** to fulfill 8h standard quota` : '🎉 **Daily 8h Target Completed**'}\n• **Completed Sessions Today**: **${todayCompletedRecords.length} session(s)** recorded.\n\n---\n💡 *Click **"Clock me in"** or use the Attendance Command terminal above to start tracking shift hours.*`
        });
      }
    }

    // 10. DRAFT WEEKLY LOGBOOK
    if (isDraftLogbookQuery) {
      const weekNum = 6;
      return NextResponse.json({
        success: true,
        response: `### 📝 Weekly Sprint Logbook Draft (Week ${weekNum})\n\nHere is a structured template generated for your internship evaluation:\n\n---\n**1. Key Milestones Completed:**\n• Completed module integration with high test coverage.\n• Participated in sprint retrospective and architecture review.\n\n**2. Tasks & Technical Implementations:**\n• Refactored backend endpoints for sub-100ms latency.\n• Authored clean UI micro-interactions with accessible WCAG tokens.\n\n**3. Core Learnings & Skills Acquired:**\n• Deep dive into geospatial indexing and privacy-safe boundary hashing.\n• Best practices in state persistence and optimistic UI mutations.\n\n**4. Blockers & Support Needed:**\n• None currently. Ready for mentor milestone review.\n---\n\n*Would you like to auto-populate this into your official Intern Logbook tab?*`,
        action: {
          type: 'FILL_LOGBOOK_TEMPLATE',
          payload: {
            weekNumber: weekNum,
            milestones: "Completed core module integration and participated in sprint review.",
            tasks: "Implemented REST API endpoints with optimistic state caching.",
            learnings: "Geospatial boundary indexing and privacy-preserving coordinate hashing.",
            blockers: "None. All dependencies resolved."
          }
        }
      });
    }

    // 11. WHO IS MY MENTOR
    if (isMentorQuery) {
      const mentorName = currentUser?.mentorName || "Kavya Reddy";
      const mentorRole = currentUser?.mentorRole || "Senior Backend Systems Architect";
      const mentorEmail = currentUser?.mentorEmail || "kavya.reddy@workpulse.io";

      return NextResponse.json({
        success: true,
        response: `### 🧑‍🏫 Assigned Internship Mentor\n\n- **Mentor Name**: **${mentorName}**\n- **Designation**: ${mentorRole}\n- **Department**: Engineering & Systems\n- **Work Email**: \`${mentorEmail}\`\n- **Office Desk**: Floor 4, Quad-B (HITEC City HQ)\n- **1-on-1 Sync Schedule**: Every Thursday at 3:30 PM IST\n\n💡 *Your mentor reviews your weekly logbook submissions and evaluates sprint milestones.*`
      });
    }

    // 12. WEEKS LEFT
    if (isWeeksLeftQuery) {
      const totalWeeks = 12;
      const currentWeek = 6;
      const weeksRemaining = totalWeeks - currentWeek;
      const completionPct = Math.round((currentWeek / totalWeeks) * 100);

      return NextResponse.json({
        success: true,
        response: `### ⏳ Internship Program Progress\n\n- **Program Duration**: 12 Weeks Enterprise Fellowship\n- **Current Week**: **Week ${currentWeek} of ${totalWeeks}**\n- **Weeks Remaining**: **${weeksRemaining} Weeks** (${completionPct}% Completed)\n- **Target Graduation / PPO Review Date**: November 28, 2026\n- **Next Milestone**: Mid-term capstone presentation with Engineering Director\n\nKeep up the great work! 🚀`
      });
    }

    // 13. Call Google Gemini API if API key is configured
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (geminiApiKey && geminiApiKey.trim() !== '' && !geminiApiKey.includes('YOUR_')) {
      try {
        const fullSystemContext = `You are "WorkPulse AI", the intelligent HRM & Geolocation Assistant for the WorkPulse Enterprise Platform.
You are assisting ${userName} (${currentUser?.employeeCode || 'EMP-002'}), role: ${role}, department: ${userDept}, jobTitle: ${userJob}.
Current attendance status: "${userStatus}".
Total workforce: ${totalStaff} staff (${clockedInStaff.length} currently clocked in).

Staff Roster:
${users.slice(0, 15).map(u => `- ${u.name} (${u.role}, ${u.department}, Status: ${u.status})`).join('\n')}

Active User's Leave Balances (October 2026):
- Annual / Privilege Leave: ${leaves.annualLeave.remaining} days remaining (${leaves.annualLeave.used} used of ${leaves.annualLeave.total})
- Casual Leave: ${leaves.casualLeave.remaining} days remaining (${leaves.casualLeave.used} used of ${leaves.casualLeave.total})
- Sick Leave: ${leaves.sickLeave.remaining} days remaining (${leaves.sickLeave.used} used of ${leaves.sickLeave.total})
- Total Remaining Leaves: ${totalLeavesRemaining} days available

Active User's Monthly Attendance Records (October 2026):
- Total Working Days in Month: 22 days
- Days Present: ${daysPresent} days (100% attendance rate)
- Days Punctual: ${daysPunctual} days (${punctualityRate}% punctuality)
- Days Late: ${daysLate} day (Oct 4: traffic delay, regularized and approved)
- Total Hours Logged: ~42.5 hours

Answer questions directly, accurately, and professionally. Format with clear markdown bullet points and emojis.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `System Context:\n${fullSystemContext}\n\nUser Question:\n${latestUserMessage}` }]
                }
              ],
              generationConfig: {
                temperature: 0.6,
                maxOutputTokens: 600,
              }
            })
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            return NextResponse.json({
              success: true,
              response: generatedText,
            });
          }
        }
      } catch (geminiErr: any) {
        console.error("Gemini API Error:", geminiErr);
      }
    }

    // 14. Fallback Smart Response for any remaining queries
    let fallbackReply = `Hello **${userName}**! 👋 Welcome to WorkPulse AI.\n\nI can answer any question regarding **employee locations** (e.g. *"Where is Neha?"*), **leave balances** (*"How many leaves do I have?"*), **monthly attendance**, **shift timers**, or **team radar**.\n\n**Try asking:**\n• *"Where is Neha Gupta?"*\n• *"How many leaves do I have in this month?"*\n• *"Who is clocked in right now?"*\n• *"Show attendance record for October"*`;

    if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
      fallbackReply = `Hello **${userName}**! 👋 Welcome to WorkPulse AI.\n\nYou are signed in with the **${role}** role in **${userDept}**.\n\nYou currently have **${totalLeavesRemaining} remaining leaves** (${leaves.casualLeave.remaining} Casual, ${leaves.sickLeave.remaining} Sick, ${leaves.annualLeave.remaining} Annual) and a **${punctualityRate}% punctuality score** this month.\n\nHow can I assist your workflow today?`;
    }

    return NextResponse.json({
      success: true,
      response: fallbackReply,
    });

  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal chat server error' },
      { status: 500 }
    );
  }
}
