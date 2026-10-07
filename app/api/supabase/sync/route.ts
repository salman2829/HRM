import { NextResponse } from 'next/server';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { db } from '@/lib/db';
import { RAW_STAFF_DATA } from '@/lib/mock-data';

export async function POST() {
  try {
    const isConfigured = isSupabaseConfigured();
    const supabase = getSupabaseClient();
    const allUsers = db.getUsers();
    const records = db.getAttendanceRecords();
    const logbooks = db.getLogbooks();

    let supabaseSyncResult = {
      attempted: true,
      configured: isConfigured,
      syncedUsersCount: 0,
      errors: [] as string[],
    };

    if (isConfigured) {
      try {
        // Attempt to upsert into `workpulse_staff` or `profiles` table in Supabase
        const staffPayload = allUsers.map(u => ({
          id: u.id,
          employee_code: u.employeeCode,
          name: u.name,
          email: u.email,
          role: u.role,
          department: u.department,
          job_title: u.jobTitle,
          phone: u.phone,
          status: u.status,
          current_shift_start: u.currentShiftStart,
          last_clock_out: u.lastClockOut,
          avatar_url: u.avatarUrl,
          mentor_name: u.mentorName || null,
          created_at: new Date().toISOString()
        }));

        const { error: staffErr } = await supabase
          .from('workpulse_staff')
          .upsert(staffPayload, { onConflict: 'id' });

        if (staffErr) {
          // Table might not exist yet, record error
          supabaseSyncResult.errors.push(`Staff Table Sync: ${staffErr.message}`);
        } else {
          supabaseSyncResult.syncedUsersCount = staffPayload.length;
        }
      } catch (err: any) {
        supabaseSyncResult.errors.push(err.message || "Supabase connection error");
      }
    }

    return NextResponse.json({
      success: true,
      message: `Database loaded with ${allUsers.length} verified employee & intern accounts.`,
      supabase: supabaseSyncResult,
      totalStaffCount: allUsers.length,
      sampleAccounts: [
        { role: 'ADMIN', name: 'Deepika Pillai', username: 'deepika.p', password: 'deepika (or Pass@123)' },
        { role: 'EMPLOYEE', name: 'Aarav Sharma', username: 'aarav.sharma', password: 'aarav (or Pass@123)' },
        { role: 'INTERN', name: 'Diya Choudhury', username: 'diya.c', password: 'diya (or Pass@123)' }
      ]
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Supabase sync failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
