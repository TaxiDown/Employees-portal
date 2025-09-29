import { useTranslations } from 'next-intl'
import React from 'react'

export default function NotFound() {
    const dict = useTranslations('pick');
  return (
    <div className="w-screen flex flex-col items-center justify-center h-screen bg-white">
      <div className="flex items-center space-x-4">
        <h1 className="border-r pr-4 text-2xl font-semibold text-black ml-10">404</h1>
        <div className="text-gray-700">
          <p className="text-lg">{dict("notFound")}</p>
        </div>
      </div>
    </div>  
    )
}
