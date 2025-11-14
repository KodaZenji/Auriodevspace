import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log('API Route - URL exists:', !!supabaseUrl);
    console.log('API Route - Key exists:', !!supabaseKey);

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
    }

    // Use direct fetch instead of Supabase client
    const response = await fetch(`${supabaseUrl}/rest/v1/accounts?select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch from Supabase' }, { status: 500 });
    }

    const data = await response.json();
    console.log('Raw data from Supabase:', data.length, 'records');

    // Transform data
    const accounts = data.map(account => ({
      id: account.id,
      handle: account.handle,
      url: account.twitter_link,
      imageUrl: account.image_url
    }));

    console.log('Returning accounts:', accounts.length);
    return NextResponse.json(accounts);

  } catch (error) {
    console.error('API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}