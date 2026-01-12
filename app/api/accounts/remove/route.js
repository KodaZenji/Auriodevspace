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
    
    if (!handle) {
      return NextResponse.json({ error: 'Handle is required' }, { status: 400 })
    }
    
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('handle', handle)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing account:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
