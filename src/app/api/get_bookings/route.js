'use server'
import {NextResponse} from 'next/server'
import { cookies } from "next/headers";
import { RefreshAccessToken } from '@/app/actions/validate_token';

export async function GET(req){
    const {searchParams} = new URL(req.url);


    const cookieStore = await cookies();
    let access = cookieStore.get('access')?.value;
    let refresh = cookieStore.get('refresh')?.value;
    const cookieHeader = `${access && `access=${access};`} refresh=${refresh}`;
    let cookieHeader2 = undefined;

    if (!access && refresh) {
        const result = await RefreshAccessToken(refresh);
        access = result.access;
        refresh = result.refresh;
    
        if (result.status === 200 && access) {
          cookieHeader2 = result.setCookie;
        } else {
          return NextResponse.json({ message: 'Unauthorized' }, { status : 401 });
        }
    }
    if(access){
        try{
            const response = await fetch(`${process.env.API_URL}api/employees/bookings/?${searchParams.toString()}`, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieHeader2 ? cookieHeader2 : cookieHeader,
                },
            });
            const bookings =  await response.json();
            if(response.status === 200){
                const res = NextResponse.json(bookings);
                if (cookieHeader2){
                    res.headers.set('Set-Cookie', cookieHeader2)
                }
                return res
            }else{
                return NextResponse.json({ message: "error"} , {status: response.status })
            }
        }catch(err){
            return NextResponse.json({ message: `Error ${err}` }, { status: 500 })
        }
    }else{
        return NextResponse.json({ message: 'Unauthorized' }, { status : 401 });
    }
}