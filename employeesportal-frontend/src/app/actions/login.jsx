'use server';
import { cookies, headers  } from "next/headers";
import { NextResponse } from 'next/server';

export async function Login(request) {
    const body = await request.json();
    let status = null;
    
    try{
      const res = await fetch(`${process.env.API_URL}api/auth/login/`, {
        headers: headers(),
        cache: "no-store",
        method: 'POST',
        body: JSON.stringify(body),
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',         
      });
      status = res.status
      if (res.status==200){
        const cookieHeader = res.headers.get('Set-Cookie');
        const response = NextResponse.json({ message: 'Login OK' });

      
        response.headers.set('Set-Cookie', cookieHeader);
        return response

        
       /* const accessToken = response.access;
        const refreshToken = response.refresh;

        cookiesStore.set({
            name: "access", 
            value: accessToken,
            httpOnly: true, 
            path: "/", 
            maxAge: 60 * 15,
            secure: process.env.NODE_ENV === "production", // Set to true in production for HTTPS
          });

          cookiesStore.set({
            name: 'refresh',
            value: refreshToken,
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            secure: process.env.NODE_ENV === 'production',
          });*/
      }
      
    }
    catch (err) {
        return status
    }
  }
  