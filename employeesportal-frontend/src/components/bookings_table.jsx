'use client'
import { Router, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

export default function BookingsTable() {
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState("");
    const router = useRouter();

    useEffect(()=>{
        const getBookings = async()=>{
            const response = await fetch(`/api/get_bookings/`,{
                method: 'GET',
                credentials: 'include',
                headers: {
                'Content-Type': 'application/json',
                }, 
            });
            if(response.status === 200){
                const bookingsObject = await response.json();
                setBookings(bookingsObject);
                console.log(bookingsObject);
            }else if(response.status === 401){
                router.push('/unauthorized');
            }else{
                setError()
            }
        }
        getBookings();
    },[])

  if(isLoading){
    <div className="flex items-center justify-center min-h-screen bg-stone-100 z-5000">
        <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 border-4 border-yellow-200 border-t-yellow-600 rounded-full animate-spin"></div>
            <p className="text-black font-lg text-3xl">Loading ...</p>
        </div>
    </div>
  }
  return (
    <div></div>
  )
}
