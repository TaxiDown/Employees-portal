'use client'

import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'
import NotFound from './not_found';
import { useTranslations } from 'next-intl';
import { Mail, Phone, Calendar } from 'lucide-react';
import { MapPin, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import RideDetails from './ride_details';
import { BadgeCheck, BadgeX } from 'lucide-react';
import Loading from './loading';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FilePlusIcon } from 'lucide-react';
import { DateRangeFilter } from './date_filter';

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

  const [isOpen, setIsOpen] = useState(false);
  const [isInvoiceOpen, setIsIvoiceOpen] = useState(false);
  const [invoice, setInvoice] = useState("");

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("Unpaid");

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'unpaid':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };

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


  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
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
    switch (status?.toLowerCase()) {
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

  const generateInvoice = async (e) => {
    const response = await fetch(`/api/generate_invoice`, {
      method: 'POST',
      Credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_driver: driverID,
        from_date: startDate,
        to_date: endDate,
        status: status,
        amount_paid: null,
        datetime_paid: null
      }),
    })
    if (response.status === 200) {
      const detailsObject = await response.json();
      setInvoice(detailsObject);
      setIsIvoiceOpen(true);
      setIsOpen(false);
    } else if (response.status === 401)
      router.push('/unauthorized');
    else if (response.status === 404)
      setNotFound(true);
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
      {showRide &&
        <RideDetails ride={showRide} setShowRide={setShowRide} />
      }
      <div className='sticky top-0 left-0 bg-white z-10 pb-8 pt-25 border-b border-stone-200 mb-2'>
        <div className='flex justify-between mb-3'>
          <h1 className='font-medium text-2xl my-3 flex items-center gap-2'>
            {driverDetails?.first_name} {driverDetails?.last_name}
            {driverDetails?.is_active
              ? <BadgeCheck strokeWidth={2.75} className='text-green-400' />
              : <BadgeX strokeWidth={2.75} className='text-red-600' />}
          </h1>
          <button onClick={() => setIsOpen(true)} className='flex gap-2 items-center text-lg text-orange-500 hover:text-orange-700 cursor-pointer font-semibold'>
            <FilePlusIcon className="" size={20} strokeWidth={2} />Generate Invoice</button>
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
      <div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-balance">Invoice</DialogTitle>
            </DialogHeader>
            <div className='mx-2 mt-2 flex flex-col'>
              <div className='flex gap-2 relative'>
                <p className="text-sm text-gray-500 mb-1">{dict("filter")}</p>
                <DateRangeFilter className="absolute top-50" setStart={setStartDate} setEnd={setEndDate} start={startDate} end={endDate} />
              </div>
              <div className='mt-3 flex gap-2'>
                <p className="text-sm text-gray-500">{dict("payment_status")}</p>
                <DropdownMenu open={open} onOpenChange={setOpen}>
                  <DropdownMenuTrigger asChild>
                    <Badge
                      className={`px-3 py-1 rounded-md text-black bg-white border border-stone-300 cursor-pointer hover:opacity-80 transition-opacity text-sm font-normal`}
                    >
                      {status == "Paid" ? "Paid" : "Unpaid"}
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setStatus("Paid")}>{"Paid"}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatus("Unpaid")}>{"Unpaid"}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

            </div>
            <div className='flex justify-center'>
              <button className='bg-orange-500 hover:bg-orange-600 rounded-full px-3 py-1' onClick={generateInvoice}> Generate</button>
            </div>
          </DialogContent>
        </Dialog>


        <Dialog open={isInvoiceOpen} onOpenChange={setIsIvoiceOpen}>
          <DialogContent className="max-h-[80vh] overflow-y-auto p-10 pt-13">
            <DialogHeader className='flex flex-row justify-between mr-10'>
              <DialogTitle className="text-balance">Invoice # {invoice?.invoice_number}</DialogTitle>
              <Badge className={getStatusColor(invoice?.status)}>
                {invoice?.status}
              </Badge>
            </DialogHeader>

            <div className="space-y-6">
              {/* Driver Information */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Driver</p>
                <p className="text-base">
                  {invoice?.driver?.first_name} {invoice?.driver?.last_name}
                </p>
              </div>

              {/* Amount Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Amount
                  </p>
                  <p className="text-base font-semibold">
                    {invoice?.total_amount !== null ? `$${invoice?.total_amount}` : 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Amount Paid
                  </p>
                  <p className="text-base font-semibold">
                    {invoice?.amount_paid !== null ? `$${invoice?.amount_paid}` : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Payment Date */}
              {invoice?.status == "paid" &&
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Payment Date
                  </p>
                  <p className="text-base">
                    {invoice?.datetime_paid ? new Date(invoice?.datetime_paid).toLocaleDateString() : 'Not paid yet'}
                  </p>
                </div>
              }
            </div>

            <div>
              <div className="overflow-x-auto mt-1 ">
                <h2 className='font-medium text-lg my-2 text-neutral-600'>{rideDict("bookingRides")} <Badge className="text-base rounded-full px-2 text-sm bg-neutral-200 text-neutral-700">{invoice?.invoice_rides?.length}</Badge>
                </h2>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">{dict("bookingNumber")}</TableHead>
                      <TableHead className="font-semibold">{rideDict("pickTime")}</TableHead>
                      <TableHead className="font-semibold">{rideDict("pickupLocation")}</TableHead>
                      <TableHead className="font-semibold">{rideDict("destination")}</TableHead>
                      <TableHead className="font-semibold">{dict("price")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice?.invoice_rides && invoice?.invoice_rides?.map((ride) => (
                      <TableRow key={ride?.id} className="hover:bg-muted/50">

                      <TableCell className="font-medium hover:text-orange-500 cursor-pointer active:text-orange-700">{ride.booking_number}</TableCell>

                      <TableCell className="space-y-1">
                          <div className="flex items-start gap-2">
                            <div className="text-sm text-muted-foreground">
                              <div className="font-medium">{ride.return_ride ? formatDateTime(ride?.datetime_return) : formatDateTime(ride?.datetime_pickup)}</div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="space-y-1">
                          <div className="flex items-start gap-2">
                            <div className="text-sm">
                              <div title={ride?.pickup_location}>{formatLocation(ride?.pickup_location)}</div>
                            </div>
                          </div>
                        </TableCell>
                        

                        <TableCell className="space-y-1">
                          <div className="flex items-start gap-2">
                            <div className="text-sm ">
                              {ride?.return_ride ? (
                                <div title={ride?.dropoff_location}>{formatLocation(ride?.dropoff_location)}</div>
                              ) :
                                <div>{"null"}</div>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="space-y-1">
                          {String(ride?.display_price)}
                        </TableCell>

                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {invoice?.invoice_rides?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{rideDict("noRecords")}</p>
                </div>
              )}
            </div>

          </DialogContent>
        </Dialog>
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
    </div >
  )
}
