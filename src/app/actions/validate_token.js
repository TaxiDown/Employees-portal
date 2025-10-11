// lib/auth/validateToken.js

export async function RefreshAccessToken(refresh) {
    if (!refresh) {
      return { status: 401, access: null, setCookie: null };
    }
  
    try {
      const res = await fetch(`${process.env.API_URL}api/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify({ refresh : refresh }),
      });
  
      if (res.status === 200) {
        const data = await res.json();
        const setCookie = res.headers.get('Set-Cookie');
        return { status: 200, access: data.access, setCookie };
      }  
      return { status: res.status, access: null, setCookie: null };
    } catch (err) {
      return { status: 500, access: null, setCookie: null };
    }
  }
  