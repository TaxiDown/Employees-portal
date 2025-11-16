"use client"
import React from 'react'

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react'
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
import InvoiceDetails from './invoice_details';
import GenerateInvoiceForm from './generate_invoice';

export default function DriverInvoicess({ driverID }) {
  const [isOpen, setIsOpen] = useState(false);
  const [invoices, setInvoices] = useState("");
  
  const router = useRouter();
  const pageSize = 10;
  const [driverDetails, setDriverDetails] = useState([]);
  const [page, setPage] = useState(1);
  const [notFound, setNotFound] = useState(false);
  const invoiceDict = useTranslations("invoice");
  const dict = useTranslations("table");
  const driver = useTranslations("driver");
  const rideDict = useTranslations("pick");

  const [isLoading, setIsLoading] = useState(true);

  const [numPages, setNumPages] = useState(0);
  const observerTarget = useRef(null);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [invoice, setInvoice] = useState("");


  const generateInvoices = async (e) => {
    const response = await fetch(`/api/get_driver_details/${driverID}/get_invoices?page_size=100`, {
      method: 'GET',
      Credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
    })
    if (response.status === 200) {
      const detailsObject = await response.json();
      console.log(detailsObject.results);
      setInvoices(detailsObject.results);
    } else if (response.status === 401)
      router.push('/unauthorized');
    else if (response.status === 404)
      setNotFound(true);
  }

  const getInvoices = async (invoiceID) => {
    const response = await fetch(`/api/get_driver_details/${driverID}/get_invoices/${invoiceID}`, {
      method: 'GET',
      Credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
    })
    if (response.status === 200) {

      const detailsObject = await response.json();
      setInvoice(detailsObject);
      setIsInvoiceOpen(true);
    } else if (response.status === 401)
      router.push('/unauthorized');
    else if (response.status === 404)
      setNotFound(true);
  }

  const formatDateTime = (dt) =>
    new Date(dt).toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });


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
    generateInvoices();
  }, []);


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

        <GenerateInvoiceForm
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          driverID={driverID}
          dict={dict}
          rideDict={rideDict}
        />
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

      <div className="overflow-x-auto mt-1 ">
        <h2 className='font-medium text-lg my-2 text-neutral-600'>{invoiceDict("invoices")} <Badge className="text-base rounded-full px-2 text-sm bg-neutral-200 text-neutral-700">{invoices?.length}</Badge>
        </h2>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">{invoiceDict("invoice_number")}</TableHead>
              <TableHead className="font-semibold">{invoiceDict("status")}</TableHead>
              <TableHead className="font-semibold">{invoiceDict("total_amount")}</TableHead>
              <TableHead className="font-semibold">{invoiceDict("amount_paid")}</TableHead>
              <TableHead className="font-semibold">{invoiceDict("datePaid")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length > 0 && invoices?.map((invoice) => (
              <TableRow key={invoice?.id} className="hover:bg-muted/50">

                <TableCell className="font-medium hover:text-orange-500 cursor-pointer active:text-orange-700" onClick={()=>getInvoices(invoice.id)}>{invoice.invoice_number}</TableCell>

                <TableCell className="space-y-1">
                  {invoice?.status}
                </TableCell>

                <TableCell className="space-y-1">
                  {String(invoice?.total_amount)}
                </TableCell>

                <TableCell className="space-y-1">
                  {String(invoice?.amount_paid)}
                </TableCell>

                <TableCell className="space-y-1">
                  <div className="flex items-start gap-2">
                    <div className="text-sm text-muted-foreground">
                      <div className="font-medium">{invoice?.datetime_paid ? formatDateTime(invoice?.datetime_paid): "null"}</div>
                    </div>
                  </div>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <InvoiceDetails
            isOpen={isInvoiceOpen}
            setIsOpen={setIsInvoiceOpen}
            invoice={invoice}
            dict={dict}
            rideDict={rideDict}
            create={false}
        />
    </div >

  )
}