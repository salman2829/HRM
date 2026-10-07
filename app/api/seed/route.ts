import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'SEED';

    if (action === 'RESET') {
      const data = db.reset();
      return NextResponse.json({
        success: true,
        message: 'Demo database reset to 30 verified Indian employees & interns with initial shift records',
        usersCount: data.users.length,
      });
    }

    if (action === 'ADD_STAFF') {
      const count = body.count || 10;
      const allUsers = db.addStaff(count);
      return NextResponse.json({
        success: true,
        message: `Added ${count} new synthetic team members across departments`,
        usersCount: allUsers.length,
      });
    }

    if (action === 'SIMULATE_CLOCKOUT') {
      const count = body.count || 5;
      const res = db.simulateClockOuts(count);
      return NextResponse.json({
        success: true,
        message: `Simulated clock-out for ${res.modifiedCount} active employees (frozen at last known locations)`,
        modifiedCount: res.modifiedCount,
      });
    }

    // Default Seed
    const count = body.count || 26;
    const data = db.seed(count);
    return NextResponse.json({
      success: true,
      message: `Generated ${data.users.length} synthetic employees & interns with verified geolocation trails`,
      usersCount: data.users.length,
      recordsCount: data.attendanceRecords.length,
      logbooksCount: data.logbooks.length
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
