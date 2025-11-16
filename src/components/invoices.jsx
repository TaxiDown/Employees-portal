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

export default function Invoices() {
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
  const [invoiceDetails, setInvoicedetails] = useState("")

  const getInvoices = async (e) => {
    const response = await fetch(`/api/get_invoices?page_size=100`, {
      method: 'GET',
      Credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
    })
    if (response.status === 200) {
      setIsLoading(false);
      const detailsObject = await response.json();
      console.log(detailsObject.results);
      setInvoices(detailsObject.results);
    } else if (response.status === 401)
      router.push('/unauthorized');
    else if (response.status === 404)
      setNotFound(true);
  }

  const getInvoice = async (driverID, invoiceID) => {
    const response = await fetch(`/api/get_driver_details/${driverID}/get_invoices/${invoiceID}`, {
      method: 'GET',
      Credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
    })
    if (response.status === 200) {

      const detailsObject = await response.json();
      setInvoicedetails(detailsObject);
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
    getInvoices();
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
    <div className='mt-20 relative w-full min-h-screen h-max px-12  mb-10 lg:w-[70%]'>

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
        <h2 className='font-medium text-xl my-2 text-black border-b border-neutral-200 pb-5'>{invoiceDict("invoices")} <Badge className="text-base rounded-full px-2 text-sm bg-neutral-200 text-neutral-700">{invoices?.length}</Badge>
        </h2>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">{invoiceDict("invoice_number")}</TableHead>
              <TableHead className="font-semibold">{invoiceDict("driver")}</TableHead>
              <TableHead className="font-semibold">{invoiceDict("status")}</TableHead>
              <TableHead className="font-semibold">{invoiceDict("total_amount")}</TableHead>
              <TableHead className="font-semibold">{invoiceDict("amount_paid")}</TableHead>
              <TableHead className="font-semibold">{invoiceDict("datePaid")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length > 0 && invoices?.map((invoice) => (
              <TableRow key={invoice?.id} className="hover:bg-muted/50">

                <TableCell className="font-medium hover:text-orange-500 cursor-pointer active:text-orange-700" onClick={()=>getInvoice(invoice.driver.id, invoice.id)}>
                    {invoice?.invoice_number}
                </TableCell>

                <TableCell className="space-y-1">
                  {invoice?.driver?.first_name} {invoice?.driver?.last_name}
                </TableCell>

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
            invoice={invoiceDetails}
            dict={dict}
            rideDict={rideDict}
            create={false}
        />
    </div >

  )
}