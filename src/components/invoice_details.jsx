"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GenerateInvoice } from "@/app/actions/generate_invoice";
import { Save } from "lucide-react";
import { BookmarkCheck, SquarePen } from "lucide-react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export default function InvoiceDetails({
  isOpen,
  setIsOpen,
  invoiceData,
  dict,
  rideDict,
  driverID,
  startDate,
  endDate,
  status,
  create = true
}) {

  const [invoice, setInvoice] = useState(invoiceData);
  const [saved, setSaved] = useState(false);

  const invoicesDict = useTranslations("invoice");

  const [isInvoiceMarkOpen, setIsInvoiceMarkOpen] = useState(false);
  const [datePaid, setDatePaid] = useState(null);

  const [changeAmount, setChangeAmount] = useState(false);

  const [updatedAmount, setUpdatedAmount] = useState(0);

  const [isLoading, setIsLoading] = useState(false)

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid": return "bg-green-100 text-green-800 px-3 py-1";
      case "unpaid": return "bg-red-100 text-red-800 px-3 py-1";
      default: return "bg-gray-100 text-gray-800 px-3 py-1";
    }
  };

  const formatDateTime = (dt) =>
    new Date(dt).toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const formatLocation = (loc) => loc?.length > 40 ? loc.slice(0, 40) + "..." : loc;

  const handleGenerate = async () => {

    const response = await GenerateInvoice(driverID, startDate, endDate, status, false)

    if (response.status === 200) {
      setSaved(true);
      setTimeout(() =>
        setSaved(false)
        , 5000)
    }

  };

  const changeAmountPaid = async () => {
    const response = await fetch(`/api/driver_invoices/${invoice.id}/change_amount_paid/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ amount_paid: updatedAmount }),
    })
    if (response.status === 200) {
      setChangeAmount(false)
      const responseObject = await response.json();
      console.log(responseObject)
      setInvoice((prev) => ({
        ...prev,
        amount_paid: updatedAmount
      }))
    }
  }

  const markPaid = async () => {
    setIsLoading(true);
    const response = await fetch(`/api/driver_invoices/${invoice.id}/mark_paid/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        datetime_paid: datePaid,
        amount_paid: updatedAmount
      }),
    })
    if (response.status === 200) {
      const responseObject = await response.json();
      console.log(responseObject);
      setInvoice((prev) => ({
        ...prev,
        flg_paid: true
      }))
      setIsInvoiceMarkOpen(false);
      setInvoice((prev) => ({
        ...prev,
        datetime_paid: datePaid,
        amount_paid: updatedAmount
      }))
    }

    setIsLoading(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[80vh] p-10 overflow-y-auto sm:w-220 sm:max-w-[80vw] md:min-w-120">
        <DialogHeader className='flex flex-row justify-between mr-10'>
          <DialogTitle className="text-balance">{invoicesDict("invoice")} # {invoice?.invoice_number}</DialogTitle>
          <div>
            {invoice?.flg_paid ?
              <Badge className={getStatusColor("Paid")}>
                {invoicesDict("paid")}
              </Badge>
              :
              <Dialog open={isInvoiceMarkOpen} onOpenChange={setIsInvoiceMarkOpen}>
                <TooltipProvider>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <Badge
                          className={`${getStatusColor("Unpaid")} cursor-pointer transition-opacity hover:opacity-80`}
                        >
                          {invoicesDict("unpaid")}
                        </Badge>
                      </DialogTrigger>
                    </TooltipTrigger>

                    <TooltipContent >
                      <p>{invoicesDict("click_to_mark")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DialogContent className="w-max px-10 py-7 flex flex-col gap-5">
                  <DialogHeader>
                    <DialogTitle>{invoicesDict("mark_paid")}</DialogTitle>
                  </DialogHeader>
                  <div className="py-2">
                    <div className="flex items-center gap-3 mb-3">
                      <p className="flex gap-1 text-sm text-black">{invoicesDict("amount_paid")}</p>
                      <input type="number" className="p-1 w-[55%] border border-gray-200 focus:border-gray-500 hover:border-gray-500 focus:border-gray-500 rounded-md" id="updatedAmount" name="updatedAmount" value={updatedAmount} onChange={(e) => setUpdatedAmount(e.target.value)} />
                    </div>

                    <Calendar
                      mode="single"
                      selected={datePaid}
                      onSelect={(date) => date && setDatePaid(date)}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className="rounded-md border"
                    />


                  </div>
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsInvoiceMarkOpen(false)}
                      disabled={isLoading}
                    >
                      {invoicesDict("cancel")}
                    </Button>
                    <Button onClick={markPaid} disabled={isLoading}>
                      {isLoading ? "..." : invoicesDict("confirm")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            }
          </div>
        </DialogHeader>

        <div className="space-y-2 my-3">


          <div className="grid grid-cols-2 gap-4">
            <div className="">
              <p className="text-sm text-muted-foreground">{invoicesDict("driver")}</p>
              <p className="text-base font-medium">
                {invoice?.driver?.first_name} {invoice?.driver?.last_name}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">{invoicesDict("total_amount")}</p>
              <p className="font-semibold">€ {invoice?.total_amount || null}</p>
            </div>
          </div>


          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="flex gap-1 text-sm text-muted-foreground">{invoicesDict("amount_paid")}
                {!invoice?.flg_paid && <button className="cursor-pointer bg-none outline-none" onClick={() => { setChangeAmount(true); setUpdatedAmount(invoice.amount_paid); }}><SquarePen className={" text-orange-300 hover:text-orange-500 "} size={17} strokeWidth={2.5} /></button>}
              </p>
              {
                changeAmount ?
                  <div className="flex justify-between mr-1 mt-3 w-max gap-2">
                    <div className="flex items-center gap-2">
                      <input type="number" className="p-1 border border-gray-200 focus:border-gray-500 hover:border-gray-500 focus:border-gray-500 rounded-md" id="updatedAmount" name="updatedAmount" value={updatedAmount} onChange={(e) => setUpdatedAmount(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={changeAmountPaid} className={`py-1 px-3 text-white text-sm rounded-md ${updatedAmount != invoice?.amount_paid ? "bg-gray-800 hover:bg-gray-900 cursor-pointer" : "bg-gray-500 cursor-not-allowed"}`}>Save</button>
                      <button onClick={() => setChangeAmount(false)} className={`text-sm rounded-md cursor-pointer text-gray-600 hover:text-gray-900`}><X size={20} /></button>

                    </div>
                  </div>
                  :
                  <p className="text-base font-medium">€ {invoice?.amount_paid || "0"}</p>
              }
            </div>

            {invoice?.flg_paid &&
              <div className="">
                <p className="text-sm text-muted-foreground">
                  {invoicesDict("datePaid")}
                </p>
                <p className="text-base font-medium">
                  {invoice?.datetime_paid ? new Date(invoice?.datetime_paid).toLocaleDateString() : 'Not paid yet'}
                </p>
              </div>
            }
          </div>

        </div>



        <div>
          <div className="overflow-x-auto mt-1 overflow-y-auto max-w-full">
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
                          {ride?.dropoff_location ? (
                            <div title={ride?.dropoff_location}>{formatLocation(ride?.dropoff_location)}</div>
                          ) :
                            <div className="pl-10">{"-"}</div>}
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
        {create &&
          <div className='flex flex-col justify-center items-center gap-2 mt-3'>
            {saved &&
              <p className="text-md text-green-600 flex gap-2 items-center font-semibold">{invoicesDict("invoice_saved")} <BookmarkCheck strokeWidth={2} size={18} /></p>
            }
            <button className='flex justify-center items-center gap-1 bg-orange-500 hover:bg-orange-600 rounded-md px-4 py-2 cursor-pointer font-semibold w-max' onClick={handleGenerate}>
              {invoicesDict("create_invoice")}<Save strokeWidth={2.5} size={16} /></button>
          </div>
        }

      </DialogContent>
    </Dialog>
  );
}
