'use server';
import { cookies, headers  } from "next/headers";
import { NextResponse } from 'next/server';

export async function POST(request) {
    const body = await request.json();
    const cookieStore = await cookies();
    const access = cookieStore.get('access')?.value;
    const refresh = cookieStore.get('refresh')?.value;
    const cookieHeader = `access=${access}; refresh=${refresh}`;
    
    let status = null;
    
    try{
      const res = await fetch(`${process.env.API_URL}api/auth/login/`, {
        cache: "no-store",
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
        'Content-Type': 'application/json',
        },
      });
      status = res.status
      if (res.status==200){
        const cookieHeader = res.headers.get('Set-Cookie');
        const response = NextResponse.json({ message: 'Login OK' });
        response.headers.set('Set-Cookie', cookieHeader);
        return response
      }else 
      return NextResponse.json({ message: 'error' }, { status: status })
    }
    catch (err) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: status })
    }
  }
  