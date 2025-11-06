'use client'

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import NotFound from './not_found';
import { useTranslations } from 'next-intl';
import { Mail, Phone, Calendar } from 'lucide-react';
import { MapPin, Clock, ChevronRight, ChevronLeft} from 'lucide-react';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import RideDetails from './ride_details';
import { BadgeCheck, BadgeX } from 'lucide-react';
import Loading from './loading';

export default function DriverDetails({ driverID }) {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [driverDetails, setDriverDetails] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const dict = useTranslations("table");
  const driver = useTranslations("driver");

  const statusDict = useTranslations("status");
  const [isLoading, setIsLoading] = useState(true);
  const [showRide, setShowRide] = useState("");

  useEffect(() => {
    const getbookings = async () => {
      const response = await fetch(`/api/get_driver_details/${driverID}/get_bookings`, {
        method: 'GET',
        Credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.status === 200) {
        const bookingsObject = await response.json();
        console.log(bookingsObject)
        setBookings(bookingsObject.results);
      } else if (response.status === 401)
        router.push('/unauthorized');
    }

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


  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "secondary"
      case "confirmed":
        return "outline"
      case "completed":
        return "default"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-orange-400"
      case "confirmed":
        return "border-green-500 text-green-500"
      case "completed":
        return "bg-green-500"
      case "canceled":
        return "bg-red-400"
      default:
        return ""
    }
  }

  const getRide = async (e) => {
    const response = await fetch(`/api/get_driver_details/${driverID}/get_bookings/${e.target.id}/`, {
      method: 'GET',
      Credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.status === 200) {
      const detailsObject = await response.json();
      setShowRide(detailsObject);
    } else if (response.status === 401)
      router.push('/unauthorized');
    else if (response.status === 404)
      setNotFound(true);
  }

  if (notFound)
    return <NotFound />

  if (isLoading)
    return <Loading />

  return (
    <div className='w-full min-h-screen h-max px-12 mt-30 mb-10 lg:w-[70%]'>
      {showRide &&
        <RideDetails ride={showRide} setShowRide={setShowRide} />
      }
      <h1 className='font-medium text-2xl my-3 flex items-center gap-2'>
        {driverDetails.first_name} {driverDetails.last_name}
        {driverDetails.is_active
          ? <BadgeCheck strokeWidth={2.75} className='text-green-400' />
          : <BadgeX strokeWidth={2.75} className='text-red-600' />}
      </h1>
      <div className='flex flex-col lg:flex-row gap-5 justify-between'>
        <div className='flex flex-col gap-3'>
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-orange-500" />
            <div>
              <p className="font-medium">{driver("dateJoined")}</p>
              <p className="text-gray-600">
                {driverDetails.date_joined.split("T")[0]}&nbsp;&nbsp;&nbsp;
                {driverDetails.date_joined.split("T")[1]}
              </p>
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-7'>
          <div className='flex items-center space-x-3'>
            <Mail size={17} className='w-5 h-5 text-orange-500' />
            <div>
              <p className="font-medium text-sm">{driver("contactInfo")}</p>
              <a href={`mailto:${driverDetails.email}`} className='flex items-center gap-2 text-gray-600 text-lg hover:text-orange-600 '>
                {driverDetails.email}
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

      {driverDetails?.services?.service &&
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2 mt-5">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 text-neutral-600">
              {driver("service")}
              <Badge variant="outline" className='text-orange-700'>{driverDetails.services.service}</Badge>
            </h3>
          </div>
        </div>
      }

      <div className="w-full mt-10">
        <div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">{dict("bookingNumber")}</TableHead>
                  <TableHead className="font-semibold">{dict("type")}</TableHead>
                  <TableHead className="font-semibold">{dict("status")}</TableHead>
                  <TableHead className="font-semibold">{dict("vehicleCategory")}</TableHead>
                  <TableHead className="font-semibold">{dict("pickupDetails")}</TableHead>
                  <TableHead className="font-semibold">{dict("contactInfo")}</TableHead>
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

                    <TableCell>
                      <Badge variant={getStatusVariant(booking.status)} className={getColor(booking.status)}>
                        {booking.status ? (statusDict(booking.status.toLowerCase()) || booking.status) : "Undefined"}
                      </Badge>
                    </TableCell>

                    <TableCell>{booking.vehicle_category}</TableCell>

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

                    {/*<TableCell>
                      <div className="flex items-center gap-2">
                        <Clock8 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-mono">{booking.datetime_pickup.split("T")[0]}</span>
                      </div>
                    </TableCell>*/}
                    {/*<TableCell className="space-y-1">
                      {booking.drivers.length >0 ?
                      <>
                        {booking?.drivers?.map((driver, key)=>(
                          <div key={key}>→ {driver}</div>
                        ))}
                      </>
                      :<div className='text-center'>{dict("unassigned")}</div>}
                    </TableCell>*/}

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
                        <span className="text-sm text-muted-foreground italic">{dict("noContact")}</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="text-sm">
                        <div className="font-medium">{booking.num_adult_seats} {dict("adults")}</div>
                        {booking.extra_child_seats.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            +{booking.extra_child_seats.reduce((sum, seat) => sum + seat.num_seats, 0)} {dict("childSeats")}
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
              <p>{dict("noRecords")}</p>
            </div>
          )}

          {/*bookings.length > 0 && numPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              {/*<div className="text-sm text-muted-foreground">
                {dict("showing")} {startIndex} {dict("to")} {Math.min(numPages, endIndex)} {dict("of")} {numPages} {dict("entries")}
              </div>}
              <div></div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={prevPage} disabled={startIndex === 1} className="flex items-center gap-1 bg-transparent">
                  <ChevronLeft className="h-4 w-4" />
                  {dict("previous")}
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(3, numPages - startIndex +1 ) }, (_, i) => page + i).map((pageNum) => (
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

                <Button variant="outline" size="sm" onClick={nextPage} disabled={page === numPages} className="flex items-center gap-1 bg-transparent">
                  {dict("next")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )*/}
        </div>
      </div>

      {/*<div>
        <div className="overflow-x-auto mt-3 ">
          <h2 className='font-medium text-lg my-2 text-neutral-600'>{dict("driverbookings")}</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">{dict("rideId")}</TableHead>
                <TableHead className="font-semibold">{dict("status")}</TableHead>
                <TableHead className="font-semibold">{dict("returnRide")}</TableHead>
                <TableHead className="font-semibold">{dict("driver")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings && bookings.map((booking) => (
                <TableRow key={booking.id} className="hover:bg-muted/50">
                  <TableCell
                    id={booking.id}
                    onClick={getRide}
                    className="font-medium hover:text-orange-500 cursor-pointer active:text-orange-700"
                  >
                    {booking.id}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(booking.status)} className={getColor(booking.status)}>
                      {statusDict(booking.status.toLowerCase())|| booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-y-1">
                    {String(booking.return_ride)}
                  </TableCell>
                  <TableCell className="space-y-1">
                    {booking.id_driver.first_name || dict("unassigned")} {booking.id_driver.last_name}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {bookings.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>{dict("noRecords")}</p>
          </div>
        )}
      </div>*/}
    </div>
  )
}
