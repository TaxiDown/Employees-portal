'use server'
import {NextResponse} from 'next/server'

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('searchQuery');
    const dropoff = searchParams.get('dropoff');
    const field = searchParams.get('field');
    const ride = searchParams.get('ride_type');
    let status = null;

    try{
        const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(searchQuery)}&components=country:es&key=${process.env.GOOGLE_API_KEY}`,{
            method: 'GET',
            headers: {'Content-Type': 'application/json',}
        })
        status = response.status
        const locations =  await response.json();
        if(response.status==200){
            const res = NextResponse.json(locations.predictions);
            return res
    }}catch(err){
        return NextResponse.json({ message: `Error ${err}` })
    }
}
