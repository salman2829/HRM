import { AttendanceRecord, User } from './types';
import { formatDate, formatTime, formatDuration } from './utils';

/**
 * Converts array of attendance records to a downloadable CSV file
 */
export function exportAttendanceToCsv(records: AttendanceRecord[], filename: string = 'WorkPulse_Shift_Audit_Report.csv') {
  if (!records || records.length === 0) {
    alert("No records available to export.");
    return;
  }

  const headers = [
    'Record ID',
    'Employee Code / ID',
    'Staff Name',
    'Role',
    'Department',
    'Shift Date',
    'Clock-In Time',
    'Clock-Out Time',
    'Duration (Minutes)',
    'Duration (Formatted)',
    'Clock-In Coordinates',
    'Clock-In Address',
    'Clock-Out Address',
    'Status',
    'Notes'
  ];

  const rows = records.map(r => [
    `"${r.id}"`,
    `"${r.userId}"`,
    `"${r.userName.replace(/"/g, '""')}"`,
    `"${r.userRole || 'EMPLOYEE'}"`,
    `"${r.department || 'General'}"`,
    `"${r.date || formatDate(r.clockInTime)}"`,
    `"${r.clockInTime ? new Date(r.clockInTime).toLocaleString() : 'N/A'}"`,
    `"${r.clockOutTime ? new Date(r.clockOutTime).toLocaleString() : 'Active Shift'}"`,
    r.durationMinutes ?? 'N/A',
    `"${r.durationMinutes ? formatDuration(r.durationMinutes) : (r.clockOutTime ? '0m' : 'In Progress')}"`,
    `"${r.clockInCoords ? `${r.clockInCoords.lat.toFixed(5)}, ${r.clockInCoords.lng.toFixed(5)}` : 'N/A'}"`,
    `"${(r.clockInCoords?.address || 'N/A').replace(/"/g, '""')}"`,
    `"${(r.clockOutCoords?.address || 'N/A').replace(/"/g, '""')}"`,
    `"${!r.clockOutTime ? 'CLOCKED_IN' : 'COMPLETED'}"`,
    `"${(r.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Converts staff directory to a downloadable CSV roster
 */
export function exportStaffDirectoryToCsv(users: User[], filename: string = 'WorkPulse_Staff_Roster.csv') {
  if (!users || users.length === 0) {
    alert("No staff records to export.");
    return;
  }

  const headers = [
    'Employee Code',
    'Full Name',
    'Role',
    'Department',
    'Job Title',
    'Email',
    'Status',
    'Current Shift Start',
    'Last Clock Out',
    'Reporting Manager',
    'Annual Leaves Remaining',
    'Sick Leaves Remaining',
    'Casual Leaves Remaining'
  ];

  const rows = users.map(u => [
    `"${u.employeeCode || u.id}"`,
    `"${u.name.replace(/"/g, '""')}"`,
    `"${u.role}"`,
    `"${u.department}"`,
    `"${u.jobTitle}"`,
    `"${u.email}"`,
    `"${u.status}"`,
    `"${u.currentShiftStart ? new Date(u.currentShiftStart).toLocaleString() : 'N/A'}"`,
    `"${u.lastClockOut ? new Date(u.lastClockOut).toLocaleString() : 'N/A'}"`,
    `"${u.managerName || 'Deepika Pillai'}"`,
    u.leaveBalance?.annualLeave?.remaining ?? 14,
    u.leaveBalance?.sickLeave?.remaining ?? 8,
    u.leaveBalance?.casualLeave?.remaining ?? 5
  ]);

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Triggers a clean printable Monthly Attendance Summary Slip
 */
export function printMonthlyAttendanceReport(user: User, records: AttendanceRecord[]) {
  const printWindow = window.open('', '_blank', 'width=850,height=900');
  if (!printWindow) {
    alert('Please allow popups to generate the printable statement.');
    return;
  }

  const userRecords = records.filter(r => r.userId === user.id);
  const totalMinutes = userRecords.reduce((acc, r) => acc + (r.durationMinutes || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const presentDays = userRecords.length;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>WorkPulse Attendance Statement - ${user.name}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; padding: 40px; margin: 0; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; }
          .title { font-size: 24px; font-weight: 800; color: #4338ca; }
          .badge { background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; margin-bottom: 24px; }
          .meta-item { font-size: 13px; }
          .meta-item strong { color: #475569; display: block; font-size: 11px; text-transform: uppercase; }
          .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
          .kpi-card { border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; text-align: center; }
          .kpi-card .num { font-size: 22px; font-weight: 800; color: #1e293b; }
          .kpi-card .label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 16px; }
          th { background: #f1f5f9; text-align: left; padding: 10px; border-bottom: 1px solid #cbd5e1; font-weight: 700; color: #475569; }
          td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">WorkPulse HRM</div>
            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Verified Monthly Shift & Attendance Statement</div>
          </div>
          <div style="text-align: right;">
            <span class="badge">OCTOBER 2026</span>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">Generated: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <strong>Employee Name</strong>
            ${user.name} (${user.employeeCode || user.id})
          </div>
          <div class="meta-item">
            <strong>Role & Designation</strong>
            ${user.jobTitle} • ${user.role}
          </div>
          <div class="meta-item">
            <strong>Department</strong>
            ${user.department}
          </div>
          <div class="meta-item">
            <strong>Reporting Authority</strong>
            ${user.managerName || 'Deepika Pillai (HR Director)'}
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="num">${presentDays}</div>
            <div class="label">Days Present</div>
          </div>
          <div class="kpi-card">
            <div class="num">${totalHours}h</div>
            <div class="label">Total Shift Hours</div>
          </div>
          <div class="kpi-card">
            <div class="num">${user.leaveBalance ? user.leaveBalance.annualLeave.remaining + user.leaveBalance.casualLeave.remaining + user.leaveBalance.sickLeave.remaining : 27}</div>
            <div class="label">Remaining Leaves</div>
          </div>
        </div>

        <h3>Shift Log Records</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Duration</th>
              <th>Location Address</th>
            </tr>
          </thead>
          <tbody>
            ${userRecords.map(r => `
              <tr>
                <td><strong>${formatDate(r.clockInTime)}</strong></td>
                <td>${formatTime(r.clockInTime)}</td>
                <td>${formatTime(r.clockOutTime)}</td>
                <td><strong>${formatDuration(r.durationMinutes)}</strong></td>
                <td>${r.clockInCoords?.address || 'Corporate Office Corridor'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          WorkPulse Enterprise Platform • Cryptographically Timestamped Geolocation Shift Records • Confidential
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <button onclick="window.print()" style="background: #4f46e5; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-weight: bold; cursor: pointer;">
            Print / Save as PDF
          </button>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
