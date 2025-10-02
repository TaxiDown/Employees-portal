import BookingsTable from '@/components/bookings_table';
import { XmlFileUploadDialog } from '@/components/file_upload';
import Navbar from '@/components/navbar';
import { CirclePlus } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function Home() {
  const dict = await getTranslations("lang");
  return (
    <div className="">
      <Navbar />
      <div className='mt-20 flex flex-col'>
        <div className=" md:mr-25 md:ml-20 flex flex-col md:flex-row items-center md:justify-between md:gap-20 mb-2">
          <XmlFileUploadDialog />
          <Link href={"/pickup"} className='flex items-center gap-2 text-orange-500 font-medium text-lg hover:text-orange-700'>
          <CirclePlus size={17} strokeWidth={2.5}/>
          {dict("create")}
          </Link>
        </div>
        <BookingsTable />
      </div>
    </div>
  );
}
