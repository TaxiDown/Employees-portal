'use server';
import { NextResponse } from 'next/server';
import { cookies } from "next/headers";

export async function GET() {
    let status = 500;
    try{
        const response = await fetch(`${process.env.API_URL}api/vehicles/vehicle-categories/`, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            },
        });
        status = response.status
        const fleets =  await response.json();
        if(response.status === 200 ){
            const res = NextResponse.json(fleets.results);
            return res
        }else{
            return NextResponse.json({ message: "error"} , {status: response.status })
        }
    }catch(err){
        return NextResponse.json({ message: `Error ${err}` }, { status: status })
    }
}
