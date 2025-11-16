'use client'
import { CirclePlus, ChevronRight, ChevronLeft, Clock8, Search, Mail } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from './ui/button';
import Loading from './loading';
import { useTranslations } from 'next-intl';
import AddDrive from './add_drive';
import Cookies from 'js-cookie';

export default function DriversTable() {
  const searchParams = useSearchParams();

  const dict = useTranslations("drivers");
  const router = useRouter();

  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [count, setCount] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const pageSize = 25;
  const [endIndex, setEndIndex] = useState(0);
  const [startIndex, setStartIndex] = useState(Number(searchParams.get("page")) || 1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtering, setFiltering] = useState({ 'ordering': '', 'status': '' });
  const [role, setRole] = useState(null);

  useEffect(() => {
    const value = Cookies.get('role');
    setRole(value);
  }, []);

  const observerTarget = useRef(null);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

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
    if(page < numPages) setPage(page+1);
  };

  useEffect(() => {
    const url = new URLSearchParams(
      Object.fromEntries(
        Object.entries(filtering).filter(([_, v]) => v)
      )
    ).toString();
    setPage(1);
    const getBookings = async () => {
      const response = await fetch(`/api/get_drivers?page_size=${pageSize}&${url ? `&${url.toLowerCase()}` : ''}${searchQuery ? `&driver_name=${searchQuery}` : ''}}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.status === 200) {
        const bookingsObject = await response.json();
        console.log(`page = ${page}`)
        console.log(bookingsObject.results)
       // console.log(Math.ceil(bookingsObject.count / pageSize))
       setDrivers(bookingsObject.results);      
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
      setIsLoadingItems(false);
    }
    getBookings();
  }, [filtering, searchQuery]);

  useEffect(() => {
    if (page === 1) return;
    const url = new URLSearchParams(
      Object.fromEntries(Object.entries(filtering).filter(([_, v]) => v))
    ).toString();

    const getdrivers = async () => {
      const response = await fetch(`/api/get_drivers?page_size=${pageSize}&page=${page}${url ? `&${url.toLowerCase()}` : ''}${searchQuery ? `&driver_name=${searchQuery}` : ''}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const driversObject = await response.json();
        setDrivers(prev => [
          ...prev,
          ...driversObject.results
        ]);
        setIsLoading(false);
        setCount(driversObject.count);
        const max = Math.ceil(driversObject.count / pageSize);
        setNumPages(max);
        setEndIndex(Math.min(3, max));
      } else if (response.status === 401) {
        router.push('/unauthorized');
      } else {
        setError();
      }
    };
    getdrivers();
  }, [page]);

  const nextPage = () => {
    if (page < numPages) {
      router.push(`/drivers?page=${Math.min(page + 1, numPages)}`)
      setEndIndex(endIndex + 1);
      setStartIndex(startIndex + 1);
      setPage((prev) => Math.min(prev + 1, numPages))
    }
  }

  const prevPage = () => {
    if (page > 1) {
      router.push(`/drivers?page=${Math.min(page - 1, 1)}`)
      setEndIndex(endIndex - 1);
      setStartIndex(startIndex - 1)
      setPage((prev) => Math.max(prev - 1, 1))
    }
  }

  const goToPage = (num = page) => {
    if(num > startIndex) setStartIndex(num);
    //else if(num < endIndex) setEndIndex(num);
    setPage(num);
    router.push(`/drivers?page=${num}`)

    const url = new URLSearchParams(
      Object.fromEntries(Object.entries(filtering).filter(([_, v]) => v))
    ).toString();


    const getdrivers = async () => {
      const response = await fetch(`/api/get_drivers?page_size=${pageSize}&page=${num}${url ? `&${url.toLowerCase()}` : ''}${searchQuery ? `&driver_name=${searchQuery}` : ''}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.status === 200) {
        const driversObject = await response.json();
       // console.log(Math.ceil(bookingsObject.count / pageSize))
        setDrivers(driversObject.results);
        setIsLoading(false);
        setCount(driversObject.count);
        const max = Math.ceil(driversObject.count / pageSize);
        setNumPages(max);
      } else if (response.status === 401) {
        router.push('/unauthorized');
      } else {
        setError();
      }
    }
    getdrivers();
  }

  const getdriverDetails = (driverNum) => {
    router.push(`/drivers/${driverNum}`);
  };

  if (isLoading) return <Loading />;

  return (
    <div className='mx-5 md:w-[70%] my-22 overflow-x-auto'>
      <div className="w-full">
        <div className='w-full flex flex-col-reverse md:flex-row gap-2 items-center justify-between mb-5'>
          <h1 className='text-black font-bold text-3xl m-2'>{dict("title")}</h1>
          <div className='relative w-max'>
            <input
              className='w-75 max-w-[85vw] h-5 p-4 rounded-full border border-neutral-400 focus:border-neutral-600 valid:border-neutral-600 outline-none'
              placeholder={dict("searchPlaceholder")}
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
              required
            />
            <Search size={18} className='absolute top-2 right-4 text-neutral-500' />
          </div>
          {role === "Super fleet manager" &&
            <AddDrive />
          }
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold text-neutral-400">{dict("driverId")}</TableHead>
              <TableHead className="font-semibold text-neutral-400">{dict("name")}</TableHead>
              <TableHead className="font-semibold text-neutral-400">{dict("email")}</TableHead>
              <TableHead className="font-semibold text-neutral-400">{dict("isActive")}</TableHead>
              <TableHead className="font-semibold text-neutral-400">{dict("dateJoined")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow key={driver.id} className="hover:bg-muted/50">
                <TableCell
                  onClick={() => getdriverDetails(driver.id)}
                  className="font-medium text-neutral-400 hover:text-orange-500 cursor-pointer active:text-orange-700"
                >
                  {driver.id}
                </TableCell>

                <TableCell>{driver.first_name} {driver.last_name}</TableCell>

                <TableCell className="space-y-1">
                  {driver.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{driver.email}</span>
                    </div>
                  )}
                </TableCell>

                <TableCell>{driver.is_active.toString()}</TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock8 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-mono">{driver.date_joined.split("T")[0]}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {drivers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>{dict("noRecords")}</p>
          </div>
        )}

        {drivers.length > 0 && page < numPages && (
            <div ref={observerTarget} className="py-8 text-center">
              {isLoadingItems && <p>Loading more...</p>}
            </div>
          )}

        
      </div>
    </div>
  );
}
