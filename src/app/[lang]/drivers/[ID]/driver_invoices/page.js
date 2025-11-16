import Navbar from '@/components/navbar'
import React from 'react'
import { cookies } from 'next/headers';
import DriverInvoicess from '@/components/driver_invoices';

export default async function Booking({params}) {
    const {ID} = await params;
    const cookie = await cookies();
    const role = cookie.get('role')?.value ?? null;
  return (
    <div className='flex justify-center'>
        <Navbar role={role}/>
        <DriverInvoicess role={role} driverID={ID}/>
    </div>
  )
}
