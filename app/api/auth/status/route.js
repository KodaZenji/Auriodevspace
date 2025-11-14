// app/api/auth/status/route.js
import { NextResponse } from 'next/server';
import { getBurnerAuth } from '@/lib/burner-auth';

export async function GET(request) {
  try {
    const burnerAuth = getBurnerAuth();
    const tokenInfo = burnerAuth.getTokenInfo();
    
    return NextResponse.json({
      burnerWallet: burnerAuth.getAddress(),
      token: tokenInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Force refresh token endpoint
export async function POST(request) {
  const adminPassword = request.headers.get('X-Admin-Password');
  
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const burnerAuth = getBurnerAuth();
    const newToken = await burnerAuth.authenticate();
    
    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      newToken: newToken,
      expiresAt: new Date(burnerAuth.tokenExpiry).toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}