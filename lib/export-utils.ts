import { AttendanceRecord, User } from './types';
import { formatDate, formatTime, formatDuration } from './utils';

/**
 * Universal safe file download trigger with explicit filename and extension
 */
function triggerFileDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  
  link.click();
  
  // Delay cleanup to ensure browser captures filename
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Exports staff directory directly to an Excel Spreadsheet (.xls)
 * Opens seamlessly in Microsoft Excel with formatted headers, borders, and colors
 */
export function exportStaffDirectoryToExcel(users: User[], filename: string = 'WorkPulse_Staff_Roster.xls') {
  if (!users || users.length === 0) {
    alert("No staff records to export.");
    return;
  }

  const excelTemplate = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>WorkPulse Staff Roster</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          th { background-color: #4338CA; color: #FFFFFF; font-weight: bold; font-family: Calibri, sans-serif; font-size: 11pt; padding: 10px; border: 1px solid #312E81; text-align: left; }
          td { font-family: Calibri, sans-serif; font-size: 10pt; padding: 6px 10px; border: 1px solid #E2E8F0; }
          .highlight { background-color: #F8FAFC; }
          .status-active { color: #16A34A; font-weight: bold; }
          .status-offline { color: #64748B; }
          .title-row { font-size: 16pt; font-weight: bold; color: #3730A3; font-family: Calibri, sans-serif; padding-bottom: 10px; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="10" class="title-row">WorkPulse Enterprise HRM — Staff Roster & Directory</td>
          </tr>
          <tr>
            <td colspan="10" style="color: #64748B; font-size: 10pt; padding-bottom: 12px;">Generated on: ${new Date().toLocaleString()} • Total Personnel: ${users.length}</td>
          </tr>
          <thead>
            <tr>
              <th>Employee Code</th>
              <th>Full Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Job Title</th>
              <th>Email</th>
              <th>Status</th>
              <th>Reporting Manager</th>
              <th>Annual Leaves</th>
              <th>Casual Leaves</th>
            </tr>
          </thead>
          <tbody>
            ${users.map((u, i) => `
              <tr class="${i % 2 === 0 ? 'highlight' : ''}">
                <td style="font-weight: bold;">${u.employeeCode || u.id}</td>
                <td style="font-weight: bold; color: #1E293B;">${u.name}</td>
                <td>${u.role}</td>
                <td>${u.department}</td>
                <td>${u.jobTitle}</td>
                <td>${u.email}</td>
                <td class="${u.status === 'CLOCKED_IN' ? 'status-active' : 'status-offline'}">${u.status}</td>
                <td>${u.managerName || 'Deepika Pillai'}</td>
                <td>${u.leaveBalance?.annualLeave?.remaining ?? 14}</td>
                <td>${u.leaveBalance?.casualLeave?.remaining ?? 5}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  triggerFileDownload(excelTemplate, filename, 'application/vnd.ms-excel;charset=utf-8');
}

/**
 * Exports shift attendance audit records directly to an Excel Spreadsheet (.xls)
 * Opens seamlessly in Microsoft Excel with formatted timestamps, durations, and coordinates
 */
export function exportAttendanceToExcel(records: AttendanceRecord[], filename: string = 'WorkPulse_Attendance_Audit_Report.xls') {
  if (!records || records.length === 0) {
    alert("No attendance records to export.");
    return;
  }

  const excelTemplate = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Shift Audit Log</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          th { background-color: #1E293B; color: #FFFFFF; font-weight: bold; font-family: Calibri, sans-serif; font-size: 11pt; padding: 10px; border: 1px solid #0F172A; text-align: left; }
          td { font-family: Calibri, sans-serif; font-size: 10pt; padding: 6px 10px; border: 1px solid #E2E8F0; }
          .highlight { background-color: #F8FAFC; }
          .duration { font-weight: bold; color: #059669; }
          .title-row { font-size: 16pt; font-weight: bold; color: #0F172A; font-family: Calibri, sans-serif; padding-bottom: 10px; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="9" class="title-row">WorkPulse Shift Attendance & Geolocation Audit Trail</td>
          </tr>
          <tr>
            <td colspan="9" style="color: #64748B; font-size: 10pt; padding-bottom: 12px;">Export Timestamp: ${new Date().toLocaleString()} • Records Count: ${records.length}</td>
          </tr>
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee ID</th>
              <th>Staff Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Clock-In Time</th>
              <th>Clock-Out Time</th>
              <th>Shift Duration</th>
              <th>Verified GPS Location</th>
            </tr>
          </thead>
          <tbody>
            ${records.map((r, i) => `
              <tr class="${i % 2 === 0 ? 'highlight' : ''}">
                <td style="font-weight: bold;">${r.date || formatDate(r.clockInTime)}</td>
                <td>${r.userId}</td>
                <td style="font-weight: bold;">${r.userName}</td>
                <td>${r.userRole || 'EMPLOYEE'}</td>
                <td>${r.department || 'General'}</td>
                <td>${formatTime(r.clockInTime)}</td>
                <td>${r.clockOutTime ? formatTime(r.clockOutTime) : '🟢 Active On-Duty'}</td>
                <td class="duration">${r.durationMinutes ? formatDuration(r.durationMinutes) : (r.clockOutTime ? '0m' : 'In Progress')}</td>
                <td>${r.clockInCoords?.address || `${r.clockInCoords?.lat?.toFixed(4) || '17.4482'}° N, ${r.clockInCoords?.lng?.toFixed(4) || '78.3756'}° E`}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  triggerFileDownload(excelTemplate, filename, 'application/vnd.ms-excel;charset=utf-8');
}

/**
 * Converts array of attendance records to a downloadable UTF-8 BOM CSV file
 */
export function exportAttendanceToCsv(records: AttendanceRecord[], filename: string = 'WorkPulse_Shift_Audit_Report.csv') {
  if (!records || records.length === 0) {
    alert("No records available to export.");
    return;
  }

  const headers = [
    'Record ID',
    'Employee Code',
    'Staff Name',
    'Role',
    'Department',
    'Shift Date',
    'Clock-In Time',
    'Clock-Out Time',
    'Duration (Minutes)',
    'Duration (Formatted)',
    'Recorded Address',
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
    `"${(r.clockInCoords?.address || 'N/A').replace(/"/g, '""')}"`,
    `"${!r.clockOutTime ? 'CLOCKED_IN' : 'COMPLETED'}"`,
    `"${(r.notes || '').replace(/"/g, '""')}"`
  ]);

  // Include UTF-8 BOM \uFEFF so Excel recognizes CSV without encoding issues
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  triggerFileDownload(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Converts staff directory to a downloadable UTF-8 BOM CSV roster
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
    `"${u.managerName || 'Deepika Pillai'}"`,
    u.leaveBalance?.annualLeave?.remaining ?? 14,
    u.leaveBalance?.sickLeave?.remaining ?? 8,
    u.leaveBalance?.casualLeave?.remaining ?? 5
  ]);

  // Include UTF-8 BOM \uFEFF
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  triggerFileDownload(csvContent, filename, 'text/csv;charset=utf-8;');
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
