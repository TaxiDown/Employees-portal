import DriversTable from '@/components/drivers_table'
import Navbar from '@/components/navbar'
import React from 'react'
import { cookies } from 'next/headers';

export default async function Drivers() {
  const cookie = await cookies();
  const role = cookie.get('role')?.value ?? null;
  return (
    <div className='flex justify-center'>
        <Navbar role={role}/>
        <DriversTable />
    </div>
  )
}
