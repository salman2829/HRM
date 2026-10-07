import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const internId = searchParams.get('internId') || undefined;

    const logbooks = db.getLogbooks(internId);
    return NextResponse.json({ success: true, logbooks });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { internId, internName, weekNumber, year, milestonesCompleted, tasksCompleted, learnings, blockers } = body;

    if (!internId || !milestonesCompleted || !tasksCompleted) {
      return NextResponse.json({ success: false, error: 'Missing required logbook fields' }, { status: 400 });
    }

    const newLogbook = db.submitLogbook({
      internId,
      internName,
      weekNumber: Number(weekNumber) || 41,
      year: Number(year) || new Date().getFullYear(),
      milestonesCompleted,
      tasksCompleted,
      learnings: learnings || '',
      blockers: blockers || '',
    });

    return NextResponse.json({ success: true, logbook: newLogbook, message: 'Logbook submitted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { logbookId, status, feedback } = body;

    if (!logbookId || !status) {
      return NextResponse.json({ success: false, error: 'logbookId and status are required' }, { status: 400 });
    }

    const updated = db.updateLogbookStatus(logbookId, status, feedback);
    return NextResponse.json({ success: true, logbook: updated, message: 'Logbook status updated' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
