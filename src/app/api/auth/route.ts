import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { password } = await request.json()
  const correctPassword = process.env.APP_PASSWORD

  if (password === correctPassword) {
    const cookieStore = await cookies()
    cookieStore.set('auth_status', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false }, { status: 401 })
}
