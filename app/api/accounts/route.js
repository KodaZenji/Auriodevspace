import { NextResponse } from 'next/server';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
    }

    // Use direct fetch to Supabase REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/accounts?select=*&order=user_id.asc`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store' // Don't cache the fetch request
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch from Supabase' }, { status: 500 });
    }

    const data = await response.json();

    // Transform data to match the expected format
    const accounts = data.map(account => ({
      id: account.user_id,
      handle: account.handle,
      url: account.url,
      imageUrl: account.imageUrl
    }));

    // Return with no-cache headers
    return NextResponse.json(accounts, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

  } catch (error) {
    console.error('API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
