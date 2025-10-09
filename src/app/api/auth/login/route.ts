import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { password } = await request.json();

  const appPassword = process.env.LIONSFLOW_PASSWORD;

  if (!appPassword) {
    console.error('LIONSFLOW_PASSWORD environment variable is not set.');
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  if (password === appPassword) {
    // Set a cookie to maintain the session
    cookies().set('lionsflow-auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    return NextResponse.json({ message: 'Login successful' }, { status: 200 });
  }

  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}
