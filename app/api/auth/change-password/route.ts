import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, oldPassword, newPassword } = body;

    // Retrieve active session if userId not provided
    const targetUserId = userId || request.cookies.get('hrm_user_id')?.value;

    if (!targetUserId) {
      return NextResponse.json({ success: false, message: 'Unauthorized - please sign in' }, { status: 401 });
    }

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ success: false, message: 'Current password and new password are required' }, { status: 400 });
    }

    // 1. Update in local storage & memory store
    const result = db.changePassword(targetUserId, oldPassword, newPassword);

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    // 2. Sync updated password to Supabase if configured
    let supabaseSynced = false;
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        const { error: supaErr } = await supabase
          .from('workpulse_staff')
          .update({ 
            password: newPassword.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', targetUserId);

        if (!supaErr) {
          supabaseSynced = true;
        }
      } catch (e) {
        console.error("Supabase password update error:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Password successfully changed! You must now use this new password to sign in.',
      supabaseSynced,
      user: result.user
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to update password' }, { status: 500 });
  }
}
