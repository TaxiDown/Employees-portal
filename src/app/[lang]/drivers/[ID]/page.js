import BookingDetails from '@/components/booking_details';
import DriverDetails from '@/components/driver_details';
import Navbar from '@/components/navbar'
import React from 'react'

export default async function Booking({params}) {
    const {ID} = await params;
  return (
    <div className='flex justify-center'>
        <Navbar />
        <DriverDetails driverID={ID}/>
    </div>
  )
}
