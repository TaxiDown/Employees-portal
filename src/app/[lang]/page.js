import BookingsTable from '@/components/bookings_table';
import Navbar from '@/components/navbar';

export default function Home() {
  return (
    <div className="">
      <Navbar />
      
      <BookingsTable />
    </div>
  );
}
