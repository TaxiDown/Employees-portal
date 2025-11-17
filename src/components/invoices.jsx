"use client"
import React from 'react'

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react'
import NotFound from './not_found';
import { useTranslations } from 'next-intl';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Loading from './loading';
import InvoiceDetails from './invoice_details';
import { Search } from 'lucide-react';
import { DateRangeFilter } from './date_filter';

export default function Invoices({ role }) {
    const [invoices, setInvoices] = useState("");

    const router = useRouter();
    const pageSize = 25;
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
    const [invoiceDetails, setInvoicedetails] = useState("");

    const [count, setCount] = useState(0);
    const [pageAdded, setPageAdded] = useState(0);

    const [searchQuery, setSearchQuery] = useState(() => {
        if (typeof window !== "undefined") {
            return sessionStorage.getItem("searchQuery") || "";
        }
        return "";
    });

    const [startDate, setStartDate] = useState(() => {
        if (typeof window !== "undefined") {
            const stored = sessionStorage.getItem("startDate");
            return stored ? new Date(stored) : null;   // ✅ convert to Date
        }
        return null;
    });

    const [endDate, setEndDate] = useState(() => {
        if (typeof window !== "undefined") {
            const stored = sessionStorage.getItem("endDate");
            return stored ? new Date(stored) : null;   // ✅ convert to Date
        }
        return null;
    });

    const getInvoices = async (e) => {
        if (page === pageAdded) return;
        const response = await fetch(`/api/get_invoices?page_size=${pageSize}&page=${page}${searchQuery ? `&search=${searchQuery}` : ''}${startDate ? `&from_date=${startDate}` : ''}${endDate ? `&to_date=${endDate}` : ''}`, {
            method: 'GET',
            Credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        if (response.status === 200) {
            setIsLoading(false);
            const detailsObject = await response.json();
            setPageAdded(page);
            if (page === 1)
                setInvoices(detailsObject.results);
            else {
                setInvoices(prev => [
                    ...prev,
                    ...detailsObject.results
                ]);
            }
            const max = Math.ceil(detailsObject.count / pageSize);
            setNumPages(max);
            setCount(detailsObject.count);
            setIsLoadingItems(false);
        } else if (response.status === 401)
            router.push('/unauthorized');
        else if (response.status === 404)
            setNotFound(true);
    }

    const getInvoicesFilter = async (e) => {
        setInvoices("")
        const response = await fetch(`/api/get_invoices?page_size=${pageSize}&${searchQuery ? `&search=${searchQuery}` : ''}${startDate ? `&from_date=${startDate}` : ''}${endDate ? `&to_date=${endDate}` : ''}`, {
            method: 'GET',
            Credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        if (response.status === 200) {
            setIsLoading(false);
            const detailsObject = await response.json();
            console.log(page, pageAdded)
            setInvoices(detailsObject.results);
            setCount(detailsObject.count);
            setIsLoadingItems(false);
        } else if (response.status === 401)
            router.push('/unauthorized');
        
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
        getInvoices();
    }, [page]);

    useEffect(() => {
        getInvoicesFilter();
    }, [searchQuery, startDate,endDate]);


    useEffect(() => {
        sessionStorage.setItem("searchQuery", searchQuery);
    }, [searchQuery]);

    useEffect(() => {
        sessionStorage.setItem("startDate", startDate ?? "");
        sessionStorage.setItem("endDate", endDate ?? "");
    }, [startDate, endDate]);


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


            <div className='sticky top-10 bg-white z-20 pt-8 pb-5 border-b border-stone-200 left-0 w-full flex-col md:flex-row min-h-15 h-max flex md:justify-between items-center mb-3 gap-5'>

                <h2 className='font-medium text-xl my-2 text-black pb-5'>
                    {invoiceDict("invoices")} <Badge className="text-base rounded-full px-2 text-sm bg-neutral-200 text-neutral-700">{count}</Badge>
                </h2>
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

                {role === "Super fleet manager" &&
                    <DateRangeFilter setStart={setStartDate} setEnd={setEndDate} start={startDate} end={endDate} />
                }


            </div>

            <div className="overflow-x-auto mt-1 ">

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

                                <TableCell className="font-medium hover:text-orange-500 cursor-pointer active:text-orange-700" onClick={() => getInvoice(invoice.driver.id, invoice.id)}>
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
                                            <div className="font-medium">{invoice?.datetime_paid ? formatDateTime(invoice?.datetime_paid) : "null"}</div>
                                        </div>
                                    </div>
                                </TableCell>


                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {invoices.length > 0 && page < numPages && (
                    <div ref={observerTarget} className="py-8 text-center">
                        {isLoadingItems && <p>{dict("loading_more")}...</p>}
                    </div>
                )}
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