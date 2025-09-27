'use server';
import { NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { RefreshAccessToken } from '@/app/actions/validate_token';

export async function POST(request) {
    const body = await request.json();
    let status = null;
    const cookieStore = await cookies();
    let access = cookieStore.get('access')?.value;
    let refresh = cookieStore.get('refresh')?.value;
    const cookieHeader = `${access && `access=${access};`} refresh=${refresh}`;
    let cookieHeader2 = undefined;

    try{
        const res = await fetch(`${process.env.API_URL}api/pricing/get-pricing/`,{
            cache: "no-store",
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieHeader,
            },
        });
        status = res.status
        if (res.status == 200){
            const price = await res.json(); 
            const response = NextResponse.json(price);
            return response
        }else 
            return NextResponse.json({ message: 'error' }, { status: status })
    }catch(err){
        return NextResponse.json({ message: err }, { status: 500})
    }    
}