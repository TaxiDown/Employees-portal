'use server';
import { NextResponse } from 'next/server';
import { cookies } from "next/headers";

export async function GET() {
    let status = 500;
    try{
        const response = await fetch(`${process.env.API_URL}api/trips/childseats/`, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            },
        });
        status = response.status
        const seats =  await response.json();
        if(response.status === 200 ){
            const res = NextResponse.json(seats.results);
            return res
        }else{
            return NextResponse.json({ status: status })
        }
    }catch(err){
        return NextResponse.json({ message: `Error ${err}` }, { status: status })
    }
}
