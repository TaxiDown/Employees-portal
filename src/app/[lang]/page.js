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
      
      <BookingsTable />
    </div>
  );
}
