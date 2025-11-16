"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DateRangeFilter } from "./date_filter";
import { GenerateInvoice } from "@/app/actions/generate_invoice";
import InvoiceDetails from "./invoice_details";

export default function GenerateInvoiceForm({
    isOpen,
    setIsOpen,
    driverID,
    dict,
    rideDict
}) {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [status, setStatus] = useState("Unpaid");
    const [openDrop, setOpenDrop] = useState(false);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [invoice, setInvoice] = useState("");

    const handleGenerate = async () => {
        const response = await GenerateInvoice(driverID, startDate, endDate, status, false)
        if (response.status === 200) {
            setInvoice(response.data);
            setIsInvoiceOpen(true);
            setIsOpen(false);
        }
    };

    return (
        <div className="">
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
                        <DropdownMenu open={openDrop} onOpenChange={setOpenDrop}>
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
                    <button className='bg-orange-500 hover:bg-orange-600 rounded-full px-3 py-1' onClick={handleGenerate}> Generate</button>
                </div>
            </DialogContent>
        </Dialog>

        <InvoiceDetails
            isOpen={isInvoiceOpen}
            setIsOpen={setIsInvoiceOpen}
            invoice={invoice}
            dict={dict}
            rideDict={rideDict}
            driverID={driverID}
            startDate={startDate}
            endDate = {endDate}
            status = {status}
        />
        </div>
    );
}
