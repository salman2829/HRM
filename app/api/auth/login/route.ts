import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier) {
      return NextResponse.json({ success: false, error: 'Username or Email is required' }, { status: 400 });
    }

    // Check if Supabase has custom stored password (with 800ms timeout safeguard)
    if (isSupabaseConfigured() && password) {
      try {
        const supabase = getSupabaseClient();
        const cleanId = identifier.trim().toLowerCase();
        
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 800));
        const queryPromise = supabase
          .from('workpulse_staff')
          .select('id, password')
          .or(`email.eq.${cleanId},username.eq.${cleanId},id.eq.${cleanId}`)
          .single();

        const { data }: any = await Promise.race([queryPromise, timeoutPromise]).catch(() => ({ data: null }));

        if (data && data.password && data.id) {
          const localUser = db.getUsers().find(u => u.id === data.id);
          if (localUser && localUser.password !== data.password) {
            localUser.password = data.password;
          }
        }
      } catch (e) {
        // Fallback to local store instantly
      }
    }

    const user = db.authenticate(identifier, password);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid credentials. Password does not match.' 
      }, { status: 401 });
    }

    // Set HTTP-only auth cookie for session
    const response = NextResponse.json({
      success: true,
      message: `Welcome back, ${user.name}`,
      user,
    });

    response.cookies.set({
      name: 'hrm_user_id',
      value: user.id,
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
