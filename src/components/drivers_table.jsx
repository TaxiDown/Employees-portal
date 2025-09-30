'use client'
import { CirclePlus } from 'lucide-react';
import { Router, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils";
import { Phone, Mail, MapPin, Clock } from "lucide-react"
import { Button } from './ui/button';
import { ChevronRight } from 'lucide-react';
import { ChevronLeft } from 'lucide-react';
import { Clock1 } from 'lucide-react';
import { Clock6Icon } from 'lucide-react';
import { Clock8 } from 'lucide-react';
import { ArrowDownUp } from 'lucide-react';
import { SlidersHorizontal } from 'lucide-react';
import { Search } from 'lucide-react';
import Loading from './loading';

export default function DriversTable() {
    const [drivers, setDrivers] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [count, setCount] =useState(0);
    const [numPages, setNumPages] = useState(0);
    const pageSize = 10;
    const router = useRouter();
    const [endIndex, setEndIndex] = useState(0);
    const [startIndex, setStartIndex] = useState(1);

    const [filtering, setFiltering] = useState({'ordering':'', 'status':''});

    useEffect(()=>{
        const url = new URLSearchParams(
          Object.fromEntries(
            Object.entries(filtering).filter(([_, v]) => v)
          )
        ).toString();
        const getdrivers = async()=>{
            const response = await fetch(`/api/get_drivers?page_size=${pageSize}&page=${page}${url?`&${url.toLowerCase()}`: ''}`,{
                method: 'GET',
                credentials: 'include',
                headers: {
                'Content-Type': 'application/json',
                }, 
            });
            if(response.status === 200){
                const driversObject = await response.json();
                setDrivers(driversObject.results);
                setIsLoading(false);
                setCount(driversObject.count);
                const max = Math.ceil(driversObject.count / pageSize);
                setNumPages(max);
                setEndIndex(Math.min(3, max))

            }else if(response.status === 401){
                router.push('/unauthorized');
            }else{
                setError();
            }
        }
        getdrivers();
    },[page, filtering])

      
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

        const getdriverDetails=(driverNum)=>{
          router.push(`/drivers/${driverNum}`);
        }

  if(isLoading)
    <Loading />
  return (
    <div className='mx-5 md:w-[70%] my-22 overflow-x-auto'>            
    <div className="w-full">
      <h1 className='text-black font-bold text-3xl m-2'>Drivers Data</h1>
      <div className="w-full">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-neutral-400">Driver ID</TableHead>
                <TableHead className="font-semibold text-neutral-400">Name</TableHead>
                <TableHead className="font-semibold text-neutral-400">Email</TableHead>
                <TableHead className="font-semibold text-neutral-400">Is Active</TableHead>
                <TableHead className="font-semibold text-neutral-400">Date Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((driver) => (
                <TableRow key={driver.id} className="hover:bg-muted/50">
                  <TableCell onClick={()=>getdriverDetails(driver.id)} className="font-medium text-neutral-400 hover:text-orange-500 cursor-pointer active:text-orange-700">{driver.id}</TableCell>

                  <TableCell>
                    {driver.first_name} {driver.last_name}
                  </TableCell>

                  <TableCell className="space-y-1">
                    {driver.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{driver.email}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {driver.is_active.toString()}
                  </TableCell>

                  <TableCell >
                      <div className="flex items-center gap-2">
                        <Clock8 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-mono">{driver.date_joined.split("T")[0]}</span>
                      </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {drivers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No driver records found.</p>
          </div>
        )}

        {drivers.length > 0 && numPages > 1 && (
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
