import DriversTable from '@/components/drivers_table'
import Navbar from '@/components/navbar'
import React from 'react'

export default async function Drivers() {
  return (
    <div className='flex justify-center'>
        <Navbar />
        <DriversTable />
    </div>
  )
}
