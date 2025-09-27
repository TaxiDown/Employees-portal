import BookingDetails from '@/components/booking_details';
import Bookings from '@/components/bookings';
import BookingsTable from '@/components/bookings_table';
import Navbar from '@/components/navbar';
import { CirclePlus } from 'lucide-react';
import {useTranslations} from 'next-intl';
import { redirect } from "next/navigation";


export default function Home() {
  return (
    <div className="">
      <Navbar />
      <div className='w-full relative top-22'>
        <button 
        className='absolute w-43 h-12 bg-white right-25 text-black flex justify-center items-center rounded-md hover:border-1 hover:border-black font-medium cursor-pointer'
        onClick={redirect('/pickup')}>
          <CirclePlus size={17} className='mr-2'/>
          Create booking</button>
      </div>
      <BookingsTable />
    </div>
  );
}
