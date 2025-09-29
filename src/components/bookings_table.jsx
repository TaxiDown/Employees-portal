'use client'
import { CirclePlus } from 'lucide-react';
import { Router, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, MapPin, Clock } from "lucide-react"
import { Button } from './ui/button';
import { ChevronRight } from 'lucide-react';
import { ChevronLeft } from 'lucide-react';

export default function BookingsTable() {
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [count, setCount] =useState(0);
    const [numPages, setNumPages] = useState(0);
    const pageSize = 10;
    const router = useRouter();
    const [endIndex, setEndIndex] = useState(0);
    const [startIndex, setStartIndex] = useState(1);


    useEffect(()=>{
        const getBookings = async()=>{
            const response = await fetch(`/api/get_bookings?page_size=${pageSize}&page=${page}`,{
                method: 'GET',
                credentials: 'include',
                headers: {
                'Content-Type': 'application/json',
                }, 
            });
            if(response.status === 200){
                const bookingsObject = await response.json();
                setBookings(bookingsObject.results);
                setIsLoading(false);
                setCount(bookingsObject.count);
                const max = Math.ceil(bookingsObject.count / pageSize);
                setNumPages(max);
                setEndIndex(Math.min(3, max))

            }else if(response.status === 401){
                router.push('/unauthorized');
            }else{
                setError();
            }
        }
        getBookings();
    },[page])


        const getBookingType = (booking) => {
          return !booking.dropoff_location ? "Per Hour":  (booking.return_ride? "Return Ride" : "One Way")
        }
      
        const getStatusVariant = (status) => {
          switch (status.toLowerCase()) {
            case "pending":
              return "secondary"
            case "confirmed":
              return "default"
            case "completed":
              return "outline"
            case "cancelled":
              return "destructive"
            default:
              return "secondary"
          }
        }
      
        const formatDateTime = (dateTime) => {
          return new Date(dateTime).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        }
      
        const formatLocation = (location) => {
          // Truncate long addresses for better table display
          return location.length > 40 ? `${location.substring(0, 40)}...` : location
        }

        const nextPage = ()=>{
          if(endIndex < numPages){
            setEndIndex(endIndex +1 );
            setStartIndex(startIndex +1);
            if(page == startIndex)
              setPage((prev)=> Math.min(prev + 1 , numPages))
          }
        }

        const prevPage = ()=>{
          if(startIndex > 1){
            setEndIndex(endIndex - 1 );
            setStartIndex(startIndex - 1)          
          }
        }

        const goToPage=(num)=>{
          setPage(num);
        }

        const getBookingDetails=(bookingNum)=>{
          router.push(`/booking_details/${bookingNum}`);
        }

      


  if(isLoading){
    <div className="flex items-center justify-center min-h-screen bg-stone-100 z-5000">
        <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 border-4 border-yellow-200 border-t-yellow-600 rounded-full animate-spin"></div>
            <p className="text-black font-lg text-3xl">Loading ...</p>
        </div>
    </div>
  }
  return (
    <div className='mx-5 md:mx-23 my-22'>
        <div className='w-full h-15 relative'>
            <button 
            className='absolute w-43 h-12 bg-white right-5 text-black flex justify-center items-center rounded-md font-medium cursor-pointer text-orange-500 hover:text-orange-600'
            onClick={() => router.push('/pickup')}>
                <CirclePlus size={17} className='mr-2'/>
                Create booking
            </button>
         </div>
    <div className="w-full">
      
      <div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Booking Number</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Pickup Details</TableHead>
                <TableHead className="font-semibold">Contact Information</TableHead>
                <TableHead className="font-semibold">Passengers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id} className="hover:bg-muted/50">
                  <TableCell onClick={()=>getBookingDetails(booking.id)} className="font-medium hover:text-orange-500 cursor-pointer active:text-orange-700">{booking.booking_number}</TableCell>

                  <TableCell>
                    <Badge variant="outline" className="font-medium">
                      {getBookingType(booking)}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                  </TableCell>

                  <TableCell className="space-y-1">
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-medium">{formatDateTime(booking.datetime_pickup)}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div className="text-sm text-muted-foreground">
                        <div title={booking.pickup_location}>{formatLocation(booking.pickup_location)}</div>
                        {booking.dropoff_location && (
                          <div className="mt-1 text-xs" title={booking.dropoff_location}>
                            → {formatLocation(booking.dropoff_location)}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="space-y-1">
                    {booking.phone_number && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-mono">{booking.phone_number}</span>
                      </div>
                    )}
                    {booking.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{booking.email}</span>
                      </div>
                    )}
                    {!booking.phone_number && !booking.email && (
                      <span className="text-sm text-muted-foreground italic">No contact info</span>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="text-sm">
                      <div className="font-medium">{booking.num_adult_seats} Adults</div>
                      {booking.extra_child_seats.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          +{booking.extra_child_seats.reduce((sum, seat) => sum + seat.num_seats, 0)} Child seats
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {bookings.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No booking records found.</p>
          </div>
        )}

        {bookings.length > 0 && numPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex} to {Math.min(numPages, endIndex)} of {numPages} entries
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevPage}
                disabled={startIndex === 1}
                className="flex items-center gap-1 bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: endIndex - startIndex + 1 }, (_, i) => startIndex + i).map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    className="min-w-[2.5rem]"
                  >
                    {pageNum}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={nextPage}
                disabled={endIndex === numPages}
                className="flex items-center gap-1 bg-transparent"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
        </div>
    </div>
  )
}
