// app/api/admin/check-admin/route.js

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Add your admin emails here
const ADMIN_EMAILS = [
  '2400072.benjamin@nict.edu.ng',
  // Add more admin emails as needed
]

export async function GET(request) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ admin: false }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Create Supabase client with service role (for verification only)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Verify the token and get user
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return NextResponse.json({ admin: false }, { status: 401 })
    }
    
    const isAdmin = ADMIN_EMAILS.includes(user.email)
    
    return NextResponse.json({ admin: isAdmin, user: { email: user.email } })
  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json({ admin: false, error: error.message }, { status: 500 })
  }
}
