import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const ADMIN_EMAILS = [
  '2400072.benjamin@nict.edu.ng',
  // Add more admin emails as needed
];

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is authenticated and admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }
    
    const { handle } = await request.json();
    
    if (!handle || !handle.trim()) {
      return NextResponse.json({ error: 'Handle is required' }, { status: 400 });
    }
    
    const cleanHandle = handle.replace('@', '').trim();
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Check if account already exists
    const checkResponse = await fetch(
      `${supabaseUrl}/rest/v1/accounts?handle=eq.${cleanHandle}&select=handle`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        }
      }
    );

    const existing = await checkResponse.json();
    
    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Account already exists' }, { status: 400 });
    }
    
    // Auto-generate URL and imageUrl
    const url = `https://x.com/${cleanHandle}`;
    const avatarUrl = `https://unavatar.io/twitter/${cleanHandle}`;
    const imageUrl = `https://images.weserv.nl/?url=${encodeURIComponent(avatarUrl)}`;
    
    // Insert new account using direct fetch
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/accounts`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        handle: cleanHandle,
        url: url,
        imageUrl: imageUrl
      })
    });

    if (!insertResponse.ok) {
      const error = await insertResponse.text();
      throw new Error(error);
    }

    const data = await insertResponse.json();
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error adding account:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
