'use client'
import React from 'react'
import { useTranslations } from 'next-intl'

export default function Loading() {
  const dict = useTranslations("common")

  return (
    <div className="flex items-center justify-center min-h-screen h-full bg-stone-100 z-5000 w-screen fixed top-0">
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 border-4 border-yellow-200 border-t-yellow-600 rounded-full animate-spin"></div>
        <p className="text-black font-lg text-3xl">{dict("loading")}</p>
      </div>
    </div>
  )
}
