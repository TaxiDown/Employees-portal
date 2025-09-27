import {React} from 'react'
import PickupFor from './pickupform';
import Navbar from '@/components/navbar';

export default async function PickupPage() {


      return (
      <div className='bg-gray-100 w-[100vw] h-lvh overflow-x-hidden'>
        <Navbar />
        <PickupFor />
    </div>
  )
}
