import React from 'react'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-stone-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 border-4 border-yellow-200 border-t-yellow-600 rounded-full animate-spin"></div>
          <p className="text-black font-lg text-3xl">Loading ...</p>
        </div>
      </div>
  );
}
