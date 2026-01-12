import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('user_id', { ascending: true })
    
    if (error) throw error
    
    // Transform data to match the expected format
    const accounts = data.map(account => ({
      id: account.user_id,
      handle: account.handle,
      url: account.url,
      imageUrl: account.imageUrl
    }))
    
    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
