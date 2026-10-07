import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userIdCookie = request.cookies.get('hrm_user_id')?.value;
    if (!userIdCookie) {
      return NextResponse.json({ success: false, user: null });
    }

    const user = db.getUserById(userIdCookie);
    if (!user) {
      return NextResponse.json({ success: false, user: null });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
