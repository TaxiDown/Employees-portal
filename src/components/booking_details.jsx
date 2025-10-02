'use client'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import NotFound from './not_found';
import { useTranslations } from 'next-intl';
import { MapPinIcon, Mail, Phone, Calendar, Timer, Clock } from 'lucide-react';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import RideDetails from './ride_details';
import Loading from './loading';
import Link from 'next/link';

export default function BookingDetails({ bookingID }) {
  const router = useRouter();
  const [rides, setRides] = useState([]);
  const [bookingDetails, setBookingDetails] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const dict = useTranslations("pick");
  const statusDict = useTranslations("status");
  const [isLoading, setIsLoading] = useState(true);
  const [showRide, setShowRide] = useState("");

  useEffect(() => {
    const getRides = async () => {
      const response = await fetch(`/api/get_booking_details/${bookingID}/get_rides`, {
        method: 'GET',
        Credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.status === 200) {
        const ridesObject = await response.json();
        setRides(ridesObject.results);
      } else if (response.status === 401)
        router.push('/unauthorized');
    }

    const getBookingDetails = async () => {
      const response = await fetch(`/api/get_booking_details/${bookingID}`, {
        method: 'GET',
        Credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.status === 200) {
        const detailsObject = await response.json();
        setBookingDetails(detailsObject);
      } else if (response.status === 401)
        router.push('/unauthorized');
      else if (response.status === 404)
        setNotFound(true);
      setIsLoading(false);
    }

    getBookingDetails();
    getRides();
  }, []);

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
    const response = await fetch(`/api/get_booking_details/${bookingID}/get_rides/${e.target.id}/`, {
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
      <h1 className='font-medium text-2xl my-3'>
        {dict("booking")} #{bookingDetails.booking_number}
      </h1>

      <div className='flex flex-col lg:flex-row gap-5 justify-between'>
        <div className='flex flex-col gap-3'>
          <h2 className='font-medium text-lg my-1 text-neutral-500'>{dict("tripDetails")}</h2>
          <div className="flex gap-4 w-100 max-w-[90%] ">
            <div className="flex flex-col items-center pt-2">
              {bookingDetails.dropoff_location ? (
                <>
                  <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-md"></div>
                  <div className="w-px h-14 bg-gray-300 my-2"></div>
                  <MapPinIcon className="w-4 h-4 text-red-500" />
                </>
              ) :
                <MapPinIcon className="w-5 h-7 text-gray-700" />
              }
            </div>
            <div className="flex flex-col h-full gap-4">
              <div className="flex items-center space-x-3">
                <div>
                  <p className="font-medium">{dict("pickupLocation")}</p>
                  <p className="text-gray-600">{bookingDetails.pickup_location || dict("notProvided")}</p>
                </div>
              </div>
              {bookingDetails.dropoff_location &&
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-medium">{dict("destination")}</p>
                    <p className="text-gray-600">{bookingDetails.dropoff_location || dict("notProvided")}</p>
                  </div>
                </div>
              }
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-orange-500" />
            <div>
              <p className="font-medium">{dict("pickTime")}</p>
              <p className="text-gray-600">{bookingDetails.datetime_pickup.split("T")[0]}{'\u00A0'}{'\u00A0'}{'\u00A0'}{bookingDetails.datetime_pickup.split("T")[1]}</p>
            </div>
          </div>

          {bookingDetails.duration >= 1 &&
            <div className="flex items-center space-x-3">
              <Timer className="w-6 h-6 text-orange-500" />
              <div>
                <p className="font-medium">{dict("duration")}</p>
                <p className="text-gray-600">{bookingDetails.duration} {bookingDetails.duration == 1 ? dict("hour") : dict("hours")}</p>
              </div>
            </div>
          }

          {bookingDetails.return_ride &&
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-medium">{dict("returnTime")}</p>
                <p className="text-gray-600">{bookingDetails.datetime_return.split("T")[0]}{'\u00A0'}{'\u00A0'}{'\u00A0'}{bookingDetails.datetime_return.split("T")[1]}</p>
              </div>
            </div>
          }
        </div>

        <div className='flex flex-col gap-7'>
          <div className='flex flex-col gap-1'>
            <h2 className='font-medium text-lg my-1 text-neutral-500'>{dict("contactInfo")}</h2>
            {bookingDetails.email &&
              <a href={`mailto:${bookingDetails.email}`} className='flex items-center gap-2 text-lg hover:text-orange-600 '>
                <Mail size={17} />
                {bookingDetails.email}
              </a>
            }
            {bookingDetails.phone_number &&
              <div className='flex items-center gap-2 text-lg'>
                <Phone size={17} />
                {bookingDetails.phone_number}
              </div>
            }
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 text-neutral-500">
              {dict("seatingRequirements")}
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-foreground">
                  {dict("adultSeats")}: <span className="font-medium">{bookingDetails.num_adult_seats}</span>
                </span>
              </div>

              {bookingDetails.extra_child_seats.map((childSeat, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-sm text-foreground">
                    {childSeat.seat_type}: <span className="font-medium ml-1">{childSeat.num_seats} {dict("seats")}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {bookingDetails?.services?.service &&
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2 mt-5">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 text-neutral-600">
              {dict("service")}
              <Badge variant="outline" className='text-orange-700'>{bookingDetails.services.service}</Badge>
            </h3>
          </div>
        </div>
      }

      <div>
        <div className="overflow-x-auto mt-3 ">
          <h2 className='font-medium text-lg my-2 text-neutral-600'>{dict("bookingRides")}</h2>

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
              {rides && rides.map((booking) => (
                <TableRow key={booking.id} className="hover:bg-muted/50">
                  <TableCell id={booking.id} onClick={getRide} className="font-medium hover:text-orange-500 cursor-pointer active:text-orange-700">
                    {booking.id}
                  </TableCell>

                  <TableCell>
                    <Badge variant={getStatusVariant(booking.status)} className={getColor(booking.status)}>
                      {statusDict(booking.status.toLowerCase()) || booking.status}                    </Badge>
                  </TableCell>

                  <TableCell className="space-y-1">
                    {String(booking.return_ride)}
                  </TableCell>
                  {booking?.id_driver ?
                    <TableCell className="space-y-1">
                      <Link href={`/drivers/${booking?.id_driver?.id}`} className='hover:text-orange-400'>
                        {booking?.id_driver?.first_name} {booking?.id_driver?.last_name}
                      </Link>
                    </TableCell>
                    :
                    <TableCell className="space-y-1">
                      {dict("unassigned")}
                    </TableCell>
                  }
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {rides.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>{dict("noRecords")}</p>
          </div>
        )}
      </div>
    </div>
  )
}
