'use client'
import { CirclePlus, Phone, Mail, MapPin, Clock, ChevronRight, ChevronLeft, Clock8, ArrowDownUp, SlidersHorizontal, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils";
import { Button } from './ui/button';
import Loading from './loading';
import { DateRangeFilter } from './date_filter';
import { useTranslations } from 'next-intl';

export default function BookingsTable() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const pageSize = 10;
  const router = useRouter();
  const [endIndex, setEndIndex] = useState(0);
  const [startIndex, setStartIndex] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filtering, setFiltering] = useState({ 'ordering': '', 'status': '' });

  const dict = useTranslations("table");
  const statusDict = useTranslations("status");

  const statusOptions = [
    { value: "All", label: dict("all"), color: "bg-red-500 text-white hover:bg-red-600" },
    { value: "Pending", label: dict("pending"), color: "bg-orange-500 text-white hover:bg-orange-600" },
    { value: "Confirmed", label: dict("confirmed"), color: "bg-blue-500 text-white hover:bg-blue-600" },
    { value: "Completed", label: dict("completed"), color: "bg-green-500 text-white hover:bg-green-600" },
    { value: "Canceled", label: dict("canceled"), color: "bg-red-500 text-white hover:bg-red-600" }
  ]

  const getColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "border-2 border-orange-400 bg-orange-400  py-1 px-4 rounded-full"
      case "confirmed":
        return "border-2 border-green-500 text-green-500 bg-white py-1 px-3 rounded-full"
      case "completed":
        return "border-2 border-green-500 bg-green-500 text-white py-1 px-3 rounded-full"
      case "canceled":
        return "border-2 border-red-400 bg-red-400  py-1 px-4 rounded-full"
      default:
        return ""
    }
  }

  useEffect(() => {
    const url = new URLSearchParams(
      Object.fromEntries(
        Object.entries(filtering).filter(([_, v]) => v)
      )
    ).toString();
    const getBookings = async () => {
      const response = await fetch(`/api/get_bookings?page_size=${pageSize}&page=${page}${url ? `&${url.toLowerCase()}` : ''}${searchQuery ? `&booking_number=${searchQuery}` : ''}${startDate? `&from_date=${startDate}` : ''}${endDate? `&to_date=${endDate}` : ''}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.status === 200) {
        const bookingsObject = await response.json();
        setBookings(bookingsObject.results);
        setIsLoading(false);
        setCount(bookingsObject.count);
        const max = Math.ceil(bookingsObject.count / pageSize);
        setNumPages(max);
        setEndIndex(Math.min(3, max))
      } else if (response.status === 401) {
        router.push('/unauthorized');
      } else {
        setError();
      }
    }
    getBookings();
  }, [page, filtering, searchQuery, startDate, endDate])

  const getBookingType = (booking) => {
    return !booking.dropoff_location
      ? dict("perHour")
      : (booking.return_ride ? dict("returnBooking") : dict("oneWay"))
  }

  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case "pending": return "secondary"
      case "confirmed": return "default"
      case "completed": return "outline"
      case "cancelled": return "destructive"
      default: return "secondary"
    }
  }

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    })
  }

  const formatLocation = (location) => {
    return location.length > 40 ? `${location.substring(0, 40)}...` : location
  }

  const nextPage = () => {
    if (endIndex < numPages) {
      setEndIndex(endIndex + 1);
      setStartIndex(startIndex + 1);
      if (page == startIndex) setPage((prev) => Math.min(prev + 1, numPages))
    }
  }

  const prevPage = () => {
    if (startIndex > 1) {
      setEndIndex(endIndex - 1);
      setStartIndex(startIndex - 1)
    }
  }

  const goToPage = (num) => setPage(num);

  const getBookingDetails = (bookingNum) => router.push(`/booking_details/${bookingNum}`);

  const sortDate = () => {
    if (filtering.ordering) {
      if (filtering.ordering === "datetime_pickup") {
        setFiltering((prev) => ({ ...prev, ordering: "-datetime_pickup" }))
      } else if (filtering.ordering === "-datetime_pickup") {
        setFiltering((prev) => ({ ...prev, ordering: "datetime_pickup" }))
      }
    } else {
      setFiltering((prev) => ({ ...prev, ordering: "datetime_pickup" }))
    }
  }

  const handleStatusChange = (status) => {
    if (status === "All") {
      setFiltering((prev) => ({ ...prev, status: "" }))
    } else {
      setFiltering((prev) => ({ ...prev, status: status }))
    }
  }

  if (isLoading) return <Loading />

  return (
    <div className='mx-5 lg:mx-23 mb-22 mt-1'>
      <div className='w-full flex-col md:flex-row min-h-15 h-max relative flex md:justify-between items-center mb-5 gap-5'>
        <div className='flex flex-row gap-2 items-center'>
          <SlidersHorizontal />
          <Select value={filtering.status} onValueChange={handleStatusChange} className={cn("h-5 p-1")} >
            <SelectTrigger className="w-[140px] h-5 text-sm border-gray-300 text-neutral-700">
              <SelectValue placeholder={dict("filterByStatus")} />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='relative w-max'>
          <input
            className='w-90 max-w-[90%] h-5 p-5 rounded-full border border-neutral-400 focus:border-neutral-600 valid:border-neutral-600 outline-none'
            placeholder={dict("searchBooking")}
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
            required
          />
          <Search className='absolute top-2 right-12 text-neutral-500' />
        </div>

        <DateRangeFilter setStart={setStartDate} setEnd={setEndDate} />
      </div>

      <div className="w-full">
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
                  <TableHead className="font-semibold flex items-center hover:text-orange-500 cursor-pointer" onClick={sortDate}>
                    <ArrowDownUp className="h-4 w-4 mr-2" /> {dict("date")}
                  </TableHead>
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
                        {statusDict(booking.status.toLowerCase()) || booking.status}
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

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock8 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-mono">{booking.datetime_pickup.split("T")[0]}</span>
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

          {bookings.length > 0 && numPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {dict("showing")} {startIndex} {dict("to")} {Math.min(numPages, endIndex)} {dict("of")} {numPages} {dict("entries")}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={prevPage} disabled={startIndex === 1} className="flex items-center gap-1 bg-transparent">
                  <ChevronLeft className="h-4 w-4" />
                  {dict("previous")}
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

                <Button variant="outline" size="sm" onClick={nextPage} disabled={endIndex === numPages} className="flex items-center gap-1 bg-transparent">
                  {dict("next")}
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
