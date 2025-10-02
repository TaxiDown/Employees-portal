'use client'

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import NotFound from './not_found';
import { useTranslations } from 'next-intl';
import { Mail, Phone, Calendar } from 'lucide-react';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import RideDetails from './ride_details';
import { BadgeCheck, BadgeX } from 'lucide-react';
import Loading from './loading';

export default function DriverDetails({ driverID }) {
  const router = useRouter();
  const [rides, setRides] = useState([]);
  const [driverDetails, setDriverDetails] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const dict = useTranslations("driver");
  const statusDict = useTranslations("status");
  const [isLoading, setIsLoading] = useState(true);
  const [showRide, setShowRide] = useState("");

  useEffect(() => {
    const getRides = async () => {
      const response = await fetch(`/api/get_driver_details/${driverID}/get_rides`, {
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
    const response = await fetch(`/api/get_driver_details/${driverID}/get_rides/${e.target.id}/`, {
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
              <p className="font-medium">{dict("dateJoined")}</p>
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
              <p className="font-medium text-sm">{dict("contactInfo")}</p>
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
              {dict("service")}
              <Badge variant="outline" className='text-orange-700'>{driverDetails.services.service}</Badge>
            </h3>
          </div>
        </div>
      }

      <div>
        <div className="overflow-x-auto mt-3 ">
          <h2 className='font-medium text-lg my-2 text-neutral-600'>{dict("driverRides")}</h2>
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

        {rides.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>{dict("noRecords")}</p>
          </div>
        )}
      </div>
    </div>
  )
}
