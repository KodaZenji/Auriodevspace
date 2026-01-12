// app/api/admin/check-admin/route.js

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Add your admin emails here
const ADMIN_EMAILS = [
  '2400072.benjamin@nict.edu.ng',
  // Add more admin emails as needed
]

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return NextResponse.json({ admin: false }, { status: 401 })
    }
    
    const isAdmin = ADMIN_EMAILS.includes(user.email)
    
    return NextResponse.json({ admin: isAdmin })
  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json({ admin: false, error: error.message }, { status: 500 })
  }
}
