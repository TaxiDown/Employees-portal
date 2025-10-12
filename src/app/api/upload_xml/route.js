'use server'
import {NextResponse} from 'next/server'
import { cookies } from "next/headers";
import { RefreshAccessToken } from '@/app/actions/validate_token';

export async function POST(request) {
    const cookieStore = await cookies();
    let access = cookieStore.get('access')?.value;
    let refresh = cookieStore.get('refresh')?.value;
    const cookieHeader = `${access && `access=${access};`} refresh=${refresh}`;
    let cookieHeader2 = undefined;

    const formData = await request.formData()
    const file = formData.get("file")

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const backendFormData = new FormData()
    backendFormData.append("file", file)


    if (!access && refresh) {
        const result = await RefreshAccessToken(refresh);
        access = result.access;
        refresh = result.refresh;
    
        if (result.status === 200 && access) {
          cookieHeader2 = result.setCookie;
        }
    }if(access){
        try{
            const response = await fetch(`${process.env.API_URL}api/employees/bookings/import-xml/`,{
                method: 'POST',
                headers:{
                    'Cookie': cookieHeader2 ? cookieHeader2 : cookieHeader,
                },
                body: backendFormData,
            });
            const jsonResponse = await response.json()
            if(response.status === 201){
                const res = NextResponse.json({ jsonResponse},{status : response.status });
                if (cookieHeader2){
                    res.headers.set('Set-Cookie', cookieHeader2)
                }
                return res
            }
            return NextResponse.json({ message: jsonResponse },{status: response.status})
        }catch(err){
            return NextResponse.json({ message: err }, { status: 500 })
        }
    }else{
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
}
