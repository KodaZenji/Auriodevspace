import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const ADMIN_EMAILS = [
  '2400072.benjamin@nict.edu.ng',
  // Add more admin emails as needed
]

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check if user is authenticated and admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (!ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }
    
    const { handle } = await request.json()
    
    if (!handle || !handle.trim()) {
      return NextResponse.json({ error: 'Handle is required' }, { status: 400 })
    }
    
    const cleanHandle = handle.replace('@', '').trim()
    
    // Check if account already exists
    const { data: existing } = await supabase
      .from('accounts')
      .select('handle')
      .eq('handle', cleanHandle)
      .single()
    
    if (existing) {
      return NextResponse.json({ error: 'Account already exists' }, { status: 400 })
    }
    
    // Auto-generate URL and imageUrl
    const url = `https://x.com/${cleanHandle}`
    const avatarUrl = `https://unavatar.io/twitter/${cleanHandle}`
    const imageUrl = `https://images.weserv.nl/?url=${encodeURIComponent(avatarUrl)}`
    
    // Insert new account
    const { data, error } = await supabase
      .from('accounts')
      .insert([
        {
          handle: cleanHandle,
          url: url,
          imageUrl: imageUrl
        }
      ])
      .select()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error adding account:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
