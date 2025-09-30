import DriversTable from '@/components/drivers_table'
import React from 'react'

export default async function Drivers() {
  return (
    <div className='flex justify-center'>
        <Navbar />
        <DriversTable />
    </div>
  )
}
