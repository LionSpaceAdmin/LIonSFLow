import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // Clear the authentication cookie
  cookies().set('lionsflow-auth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: -1, // Expire the cookie immediately
    path: '/',
  });

  return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
}
