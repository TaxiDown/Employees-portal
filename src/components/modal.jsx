'use client'
import { useTranslations } from 'next-intl'

export default function SuccessModal({ type }) {
  const dict = useTranslations("modal")

  return (
    <>
      {type === 'success' ? (
        <div className="fixed inset-0 top-0 left-0 z-50 flex items-center justify-center bg-black/50 h-full w-screen">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
            <h2 className="text-green-600 text-xl font-semibold mb-2">
              {dict("ride_created")}
            </h2>
          </div>
        </div>
      ) : (type === 'limit' ? (
        <div className="fixed inset-0 top-0 left-0 z-50 flex items-center justify-center bg-black/50 h-full w-screen">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
            <h2 className="text-red-600 text-xl font-semibold mb-2">
              {dict("limit_reached")}
            </h2>
          </div>
        </div>
      ):
        <div className="fixed inset-0 top-0 left-0 z-50 flex items-center justify-center bg-black/50 h-full w-screen">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
            <h2 className="text-green-600 text-xl font-semibold mb-2">
              {dict("limit_reached")}
            </h2>
          </div>
        </div>
      )}
    </>
  )
}
