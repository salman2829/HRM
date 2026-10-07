import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    const requests = db.getRegularizations(userId);
    return NextResponse.json({ success: true, requests, count: requests.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userName, userRole, type, date, endDate, proposedClockIn, proposedClockOut, leaveType, reason } = body;

    if (!userId || !type || !date || !reason) {
      return NextResponse.json({ 
        success: false, 
        error: 'userId, type, date, and reason are required' 
      }, { status: 400 });
    }

    const newRequest = db.submitRegularization({
      userId,
      userName,
      userRole,
      type,
      date,
      endDate,
      proposedClockIn,
      proposedClockOut,
      leaveType,
      reason
    });

    return NextResponse.json({
      success: true,
      message: type === 'REGULARIZATION' ? 'Attendance Regularization submitted for manager approval.' : 'Leave request submitted successfully.',
      request: newRequest
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, managerNotes } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'id and status are required' }, { status: 400 });
    }

    const updated = db.updateRegularizationStatus(id, status, managerNotes);
    return NextResponse.json({
      success: true,
      message: `Request marked as ${status}`,
      request: updated
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
