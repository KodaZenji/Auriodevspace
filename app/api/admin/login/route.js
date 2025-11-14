import { NextResponse } from 'next/server';

export async function POST(request) {
  const { password } = await request.json();
  const correctPassword = process.env.ADMIN_PASSWORD;

  if (password === correctPassword) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
}
