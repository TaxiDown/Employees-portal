import BookingDetails from '@/components/booking_details';
import Navbar from '@/components/navbar'
import React from 'react'
import { cookies } from 'next/headers';

export default async function Booking({params}) {
    const {ID} = await params;
    const cookie = await cookies();
    const role = cookie.get('role')?.value ?? null;
  return (
    <div className='flex justify-center'>
        <Navbar role={role}/>
        <BookingDetails bookingID={ID}/>
    </div>
  )
}
