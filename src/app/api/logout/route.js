'use server'
import { NextResponse } from "next/server"
import { cookies } from "next/headers"


export async function POST() {
  const cookieStore = await cookies();

  const cookieHeader = cookieStore.getAll()
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ');

  try {
    const response = await fetch(`${process.env.API_URL}api/auth/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
    });

    if (response.status === 200) {
      cookieStore.delete('access');
      cookieStore.delete('refresh');
      cookieStore.delete('csrftoken');
      cookieStore.delete('sessionid');
      cookieStore.delete('role');

      return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Logout failed' }, { status: response.status });
    }

  } catch (err) {
    return NextResponse.json({ message: `Error: ${err}` }, { status: 500 });
  }
}
