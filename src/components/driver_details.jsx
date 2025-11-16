'use client'

import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'
import NotFound from './not_found';
import { useTranslations } from 'next-intl';
import { Mail, Phone, Calendar } from 'lucide-react';
import { MapPin, Clock } from 'lucide-react';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BadgeCheck, BadgeX } from 'lucide-react';
import Loading from './loading';
import { FilePlusIcon } from 'lucide-react';
import { StickyNote } from 'lucide-react';


export default function DriverDetails({ driverID }) {
  const router = useRouter();
  const pageSize = 10;
  const [bookings, setBookings] = useState([]);
  const [driverDetails, setDriverDetails] = useState([]);
  const [page, setPage] = useState(1);
  const [notFound, setNotFound] = useState(false);
  const dict = useTranslations("table");
  const driver = useTranslations("driver");
  const rideDict = useTranslations("pick");
  const statusrideDict = useTranslations("status");

  const [isLoading, setIsLoading] = useState(true);
  const [showRide, setShowRide] = useState("");

  const [numPages, setNumPages] = useState(0);
  const observerTarget = useRef(null);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  const getbookings = async () => {
    const response = await fetch(`/api/get_driver_details/${driverID}/get_bookings?page_size=${pageSize}&page=${page}`, {
      method: 'GET',
      Credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (response.status === 200) {
      const bookingsObject = await response.json();
      setBookings(prev => {
        const prevIds = new Set(prev.map(b => b.id));

        const newItems = bookingsObject.results.filter(
          b => !prevIds.has(b.id)
        );

        return [...prev, ...newItems];
      });
      setIsLoading(false);
      const max = Math.ceil(bookingsObject.count / pageSize);
      setNumPages(max);
    } else if (response.status === 401)
      router.push('/unauthorized');

    setIsLoadingItems(false);

  }

  useEffect(() => {
    if (page === 1) return;
    getbookings();
  }, [page])

  useEffect(() => {
    const getdriverDetails = async () => {
      const response = await fetch(`/api/get_driver_details/${driverID}`, {
        method: 'GET',
        Credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.status === 200) {
        const detailsObject = await response.json();
        setDriverDetails(detailsObject);
      } else if (response.status === 401)
        router.push('/unauthorized');
      else if (response.status === 404)
        setNotFound(true);
      setIsLoading(false);
    }

    getdriverDetails();
    getbookings();
  }, []);

  const getBookingDetails = (bookingNum) => router.push(`/booking_details/${bookingNum}`);

  const getBookingType = (booking) => {
    return !booking.dropoff_location
      ? dict("perHour")
      : (booking.return_ride ? dict("returnBooking") : dict("oneWay"))
  }

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    })
  }

  const formatLocation = (location) => {
    return location.length > 40 ? `${location.substring(0, 40)}...` : location
  }


  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingItems) {
          setIsLoadingItems(true);
          loadMoreItems();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  });

  const loadMoreItems = () => {
    if (page < numPages) setPage(page + 1);
  };

  if (notFound)
    return <NotFound />

  if (isLoading)
    return <Loading />

  return (
    <div className='relative w-full min-h-screen h-max px-12  mb-10 lg:w-[70%]'>
      <div className='sticky top-0 left-0 bg-white z-10 pb-8 pt-25 border-b border-stone-200 mb-2'>
        <div className='flex justify-between mb-3'>
          <h1 className='font-medium text-2xl my-3 flex items-center gap-2'>
            {driverDetails?.first_name} {driverDetails?.last_name}
            {driverDetails?.is_active
              ? <BadgeCheck strokeWidth={2.75} className='text-green-400' />
              : <BadgeX strokeWidth={2.75} className='text-red-600' />}
          </h1>

          <button onClick={() => router.push(`/drivers/${driverID}/driver_invoices`)} className='flex gap-1 items-center items-center text-lg text-orange-500 hover:text-orange-700 cursor-pointer font-semibold'>
            <StickyNote className="" size={20} strokeWidth={2} />Invoices</button>

        </div>
        <div className='flex flex-col lg:flex-row gap-5 justify-between'>
          <div className='flex flex-col gap-3'>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-medium">{driver("dateJoined")}</p>
                <p className="text-gray-600">
                  {driverDetails?.date_joined?.split("T")[0]}&nbsp;&nbsp;&nbsp;
                  {driverDetails?.date_joined?.split("T")[1]}
                </p>
              </div>
            </div>
          </div>
          <div className='flex flex-col gap-7'>
            <div className='flex items-center space-x-3'>
              <Mail size={17} className='w-5 h-5 text-orange-500' />
              <div>
                <p className="font-medium text-sm">{driver("contactInfo")}</p>
                <a href={`mailto:${driverDetails?.email}`} className='flex items-center gap-2 text-gray-600 text-lg hover:text-orange-600 '>
                  {driverDetails?.email}
                </a>
              </div>
              {driverDetails?.phone_number &&
                <div className='flex items-center gap-2 text-lg'>
                  <Phone size={17} />
                  {driverDetails.phone_number}
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      {
        driverDetails?.services?.service &&
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2 mt-5">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 text-neutral-600">
              {driver("service")}
              <Badge variant="outline" className='text-orange-700'>{driverDetails?.services?.service}</Badge>
            </h3>
          </div>
        </div>
      }


      <div className="w-full mt-0">
        <div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">{dict("bookingNumber")}</TableHead>
                  <TableHead className="font-semibold">{dict("type")}</TableHead>
                  <TableHead className="font-semibold">{dict("vehicleCategory")}</TableHead>
                  <TableHead className="font-semibold">{dict("price")}</TableHead>
                  <TableHead className="font-semibold">{dict("pickupDetails")}</TableHead>
                  <TableHead className="font-semibold">{dict("passengers")}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id} className="hover:bg-muted/50">
                    <TableCell onClick={() => getBookingDetails(booking.id)} className="font-medium hover:text-orange-500 cursor-pointer active:text-orange-700">{booking.booking_number}</TableCell>

                    <TableCell>
                      <Badge variant="outline" className="font-medium">{getBookingType(booking)}</Badge>
                    </TableCell>

                    <TableCell>{booking?.vehicle_category}</TableCell>

                    <TableCell>{booking?.driver_price || "null"}</TableCell>

                    <TableCell className="space-y-1">
                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="text-sm">
                          <div className="font-medium">{formatDateTime(booking?.datetime_pickup)}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="text-sm text-muted-foreground">
                          <div title={booking?.pickup_location}>{formatLocation(booking?.pickup_location)}</div>
                          {booking?.dropoff_location && (
                            <div className="mt-1 text-xs" title={booking?.dropoff_location}>
                              → {formatLocation(booking?.dropoff_location)}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>


                    <TableCell className="text-center">
                      <div className="text-sm">
                        <div className="font-medium">{booking?.num_adult_seats} {dict("adults")}</div>
                        {booking?.extra_child_seats?.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            +{booking?.extra_child_seats?.reduce((sum, seat) => sum + seat?.num_seats, 0)} {dict("childSeats")}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {bookings?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>{dict("noRecords")}</p>
            </div>
          )}

          {bookings?.length > 0 && page < numPages && (
            <div ref={observerTarget} className="py-8 text-center">
              {isLoadingItems && <p>Loading more...</p>}
            </div>
          )}
        </div>
      </div>
    </div >
  )
}
