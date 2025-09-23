'use server';

import { RefreshAccessToken } from "@/app/actions/validate_token";
import { cookies } from "next/headers";
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = await cookies();
  let access = cookieStore.get('access')?.value;
  let refresh = cookieStore.get('refresh')?.value;

  if (access) {
    try {
      const res = await fetch(`${process.env.API_URL}api/auth/token/verify/`, {
        cache: "no-store",
        method: 'POST',
        body: JSON.stringify({ token: access }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.status === 200) {
        return NextResponse.json({ message: 'valid Token' }, { status: 200 });
      } else {
        return NextResponse.json({ message: 'Invalid Token' }, { status: res.status });
      }
    } catch (err) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 }); // ✅ Default fallback
    }
  }

  if (!access && refresh) {
    
    const result = await RefreshAccessToken(refresh);
    const status = result.status;

    if (status === 200 ) {
      const response = NextResponse.json({ message: 'Token refreshed' }, { status: 200 });
      response.headers.set('Set-Cookie', result.setCookie);
{/*      response.headers.set('Set-Cookie', `access=${access}; refresh=${refresh}; Path=/; HttpOnly`);
*/}    return response;
    } else {
      return NextResponse.json({ message: 'Unauthorized' }, { status: status || 401 });
    }
  }
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
}
