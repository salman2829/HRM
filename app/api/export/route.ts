import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { formatDate, formatTime, formatDuration } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'staff'; // 'staff' | 'attendance'
    const format = searchParams.get('format') || 'excel'; // 'excel' | 'csv'
    const userId = searchParams.get('userId') || undefined;

    const users = db.getUsers();
    const records = db.getAttendanceRecords(userId);

    // ==========================================
    // 1. EXPORT STAFF ROSTER AS EXCEL (.XLS)
    // ==========================================
    if (type === 'staff' && format === 'excel') {
      const excelXml = `
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

      return new NextResponse(excelXml, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
          'Content-Disposition': 'attachment; filename="WorkPulse_Staff_Roster.xls"',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // ==========================================
    // 2. EXPORT ATTENDANCE AS EXCEL (.XLS)
    // ==========================================
    if (type === 'attendance' && format === 'excel') {
      const excelXml = `
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

      return new NextResponse(excelXml, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
          'Content-Disposition': 'attachment; filename="WorkPulse_Attendance_Audit_Report.xls"',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // ==========================================
    // 3. EXPORT STAFF ROSTER AS CSV (.CSV)
    // ==========================================
    if (type === 'staff' && format === 'csv') {
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

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="WorkPulse_Staff_Roster.csv"',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // ==========================================
    // 4. EXPORT ATTENDANCE AS CSV (.CSV)
    // ==========================================
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

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="WorkPulse_Shift_Audit_Report.csv"',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
