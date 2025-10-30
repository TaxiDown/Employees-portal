import {React} from 'react'
import PickupFor from './pickupform';
import Navbar from '@/components/navbar';
import { cookies } from 'next/headers';

export default async function PickupPage() {
  const cookie = await cookies();
  const role = cookie.get('role')?.value ?? null;
      return (
      <div className='bg-gray-100 w-[100vw] h-lvh overflow-x-hidden'>
        <Navbar role={role}/>
        <PickupFor />
    </div>
  )
}
