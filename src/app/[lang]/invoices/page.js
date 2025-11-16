import DriversTable from '@/components/drivers_table'
import Navbar from '@/components/navbar'
import React from 'react'
import { cookies } from 'next/headers';
import Invoices from '@/components/invoices';

export default async function InvoicesPage() {
  const cookie = await cookies();
  const role = cookie.get('role')?.value ?? null;
  return (
    <div className='flex justify-center'>
        <Navbar role={role}/>
        <Invoices role={role}/>
    </div>
  )
}
