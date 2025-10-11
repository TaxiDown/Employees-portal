import BookingDetails from '@/components/booking_details';
import Navbar from '@/components/navbar'
import React from 'react'

export default async function Booking({params}) {
    const {ID} = await params;
  return (
    <div className='flex justify-center'>
        <BookingDetails bookingID={ID}/>
    </div>
  )
}
