import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    const records = db.getAttendanceRecords(userId);
    return NextResponse.json({ success: true, records, count: records.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, coords, notes } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    if (action === 'CLOCK_IN') {
      const result = db.clockIn(userId, coords || {}, notes);
      return NextResponse.json({
        success: true,
        message: 'Clocked in successfully',
        user: result.user,
        record: result.record
      });
    }

    if (action === 'CLOCK_OUT') {
      const result = db.clockOut(userId, coords || {}, notes);
      return NextResponse.json({
        success: true,
        message: 'Clocked out successfully',
        user: result.user,
        record: result.record
      });
    }

    if (action === 'UPDATE_LOCATION') {
      const updatedUser = db.updateLocation(userId, coords || {});
      return NextResponse.json({
        success: true,
        message: 'Location updated',
        user: updatedUser
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action provided' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
