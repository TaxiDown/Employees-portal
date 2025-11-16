"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GenerateInvoice } from "@/app/actions/generate_invoice";
import { Save } from "lucide-react";
import { BookmarkCheck } from "lucide-react";

export default function InvoiceDetails({
  isOpen,
  setIsOpen,
  invoice,
  dict,
  rideDict,
  driverID,
  startDate,
  endDate,
  status,
  create = true
}) {

  const [saved, setSaved] = useState(false);
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid": return "bg-green-100 text-green-800";
      case "unpaid": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDateTime = (dt) =>
    new Date(dt).toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const formatLocation = (loc) => loc?.length > 40 ? loc.slice(0, 40) + "..." : loc;

  const handleGenerate = async () => {

    const response = await GenerateInvoice(driverID, startDate, endDate, status, true)

    if (response.status === 200) {
      setSaved(true);
      setTimeout(() =>
        setSaved(false)
        , 5000)
    }

  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[80vh] overflow-y-auto p-10">
        <DialogHeader className='flex flex-row justify-between mr-10'>
          <DialogTitle className="text-balance">Invoice # {invoice?.invoice_number}</DialogTitle>
          <Badge className={getStatusColor(invoice?.status)}>
            {invoice?.status}
          </Badge>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Driver</p>
            <p className="text-base">
              {invoice?.driver?.first_name} {invoice?.driver?.last_name}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="font-semibold">${invoice?.total_amount || null}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Amount Paid</p>
              <p className="text-base font-semibold">${invoice?.amount_paid || "N/A"}</p>
            </div>
          </div>
        </div>

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
                          {ride?.dropoff_location ? (
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
        {create &&
        <div className='flex flex-col justify-center items-center gap-2'>
        {saved &&
          <p className="text-md text-green-600 flex gap-2 items-center font-semibold">Invoice saved <BookmarkCheck strokeWidth={2} size={18} /></p>
        }
        <button className='flex justify-center items-center gap-1 bg-orange-500 hover:bg-orange-600 rounded-md px-4 py-2 cursor-pointer font-semibold w-max' onClick={handleGenerate}>
          Create Invoice <Save strokeWidth={2.5} size={16} /></button>
      </div>
      }
        
      </DialogContent>
    </Dialog>
  );
}
