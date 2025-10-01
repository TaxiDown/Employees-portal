"use client"
import { X } from 'lucide-react'
import React, { useEffect } from 'react'
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ClockIcon, DollarSignIcon, UserIcon, CarIcon } from "lucide-react"
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react'


export default function RideDetails({ ride, setShowRide }) {
    const router = useRouter();
    const [assignedDriverDetails, setAssignedDriverDetails] = useState('');
    const [currentStatus, setCurrentStatus] = useState(ride.status)
    const [assignedDriver, setAssignedDriver] = useState(ride.id_driver)
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [drivers, setDrivers] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [reload, setReload] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "pending":
                return "bg-orange-400"
            case "confirmed":
                return "border-2 border-green-500 text-green-500 bg-white"
            case "completed":
                return "bg-green-500"
            case "canceled":
                return "bg-red-400"
            default:
                return ""
        }
    }

    const handleStatusChange = async (newStatus) => {
        const response = await fetch(`/api/get_booking_details/${ride.id_booking}/get_rides/${ride.id}/change-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ "status": newStatus }),
        })
        if (response.status === 200) {
            setCurrentStatus(newStatus);
            setReload(true);
        } else {

        }
    }

    const handleDriverAssignment = async (driverId) => {
        const response = await fetch(`/api/get_booking_details/${ride.id_booking}/get_rides/${ride.id}/assign_driver`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ "driver_id": driverId }),
        })
        if (response.status === 200) {
            setAssignedDriver(driverId);
            setIsDialogOpen(false);
            setReload(true);
        }
    }

    const getAssignedDriverDetails = () => {
        if (!assignedDriver) return null
        return drivers.find((driver) => driver.id == assignedDriver)
    }

    useEffect(() => {
        setAssignedDriverDetails(getAssignedDriverDetails());
    }, [drivers, assignedDriver])

    useEffect(() => {
        if (currentStatus === "Completed" || currentStatus === "Canceled")
            setStatusOptions([])
        else if (!assignedDriver) {
            setStatusOptions([
                {
                    value: "Pending",
                    label: "Pending",
                    color: "bg-orange-500 text-white hover:bg-orange-600",
                },
                {
                    value: "Canceled",
                    label: "Canceled",
                    color: "bg-red-500 text-white hover:bg-red-600",
                },
            ]);
        } else if (currentStatus === "Confirmed") {
            setStatusOptions([
                {
                    value: "Confirmed",
                    label: "Confirmed",
                    color: "bg-blue-500 text-white hover:bg-blue-600",
                },
                {
                    value: "Completed",
                    label: "Completed",
                    color: "bg-green-500 text-white hover:bg-green-600",
                },
                {
                    value: "Canceled",
                    label: "Canceled",
                    color: "bg-red-500 text-white hover:bg-red-600",
                },])
        }
    }, [assignedDriver, currentStatus])

    useEffect(() => {
        const getdrivers = async () => {
            const response = await fetch(`/api/get_drivers?page_size=100${searchQuery ? `&driver_name=${searchQuery}` : ''}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.status === 200) {
                const driversObject = await response.json();
                setDrivers(driversObject.results);
                console.log(driversObject.results)
            } else if (response.status === 401) {
                router.push('/unauthorized');
            } else {
                setError();
            }
        }
        getdrivers();
    }, [searchQuery]);

    return (
        <div className='fixed top-0 left-0 z-50 w-screen h-screen bg-black/20 backdrop-blur-xs flex items-center justify-center '>
            <div className='w-[80%] lg:w-[50%] h-160 md:h-150 bg-white rounded-xl relative px-10 py-10 md:p-20 overflow-y-auto'>
                <X size={27} className='absolute top-7 right-7 cursor-pointer' onClick={() => { setShowRide(""); if (reload) window.location.reload(); }} />
                <div className="flex flex-col gap-2 md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-gray-200">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Ride #{ride.id}</h3>
                        <p className="text-sm text-gray-500 mt-1">Booking ID: {ride.id_booking}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className={`px-3 py-1 rounded-full font-medium ${getStatusColor(currentStatus)}`}>
                            {currentStatus}
                        </Badge>
                        {statusOptions.length > 0 &&
                            <Select value={currentStatus} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-[140px] h-9 text-sm border-gray-300">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        }
                    </div>
                </div>

                <div className="flex flex-col md:grid md:grid-cols-2  gap-6">
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Price</p>
                            <div className="flex items-center gap-2">
                                <DollarSignIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-base font-semibold text-gray-900">${ride.price}</span>
                            </div>
                        </div>
                        {ride.duration !== "00:00:00" &&
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Duration</p>
                                <div className="flex items-center gap-2">
                                    <ClockIcon className="h-4 w-4 text-gray-400" />
                                    <span className="text-base text-gray-900">{ride.duration}</span>
                                </div>
                            </div>
                        }

                        <div>
                            <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                            <Badge
                                className={`px-3 py-1 rounded-full font-medium ${ride.flg_paid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {ride.flg_paid ? "Paid" : "Unpaid"}
                            </Badge>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Driver</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <UserIcon className="h-4 w-4 text-gray-400" />
                                    <div>
                                        {assignedDriverDetails ? (
                                            <>
                                                <span className="text-base text-gray-900 block">{assignedDriverDetails.first_name} {assignedDriverDetails.last_name}</span>
                                            </>
                                        ) : (
                                            <span className="text-base text-gray-900">Unassigned</span>
                                        )}
                                    </div>
                                </div>
                                {ride.status !== "Canceled" && ride.status !== "Completed" &&
                                    <Dialog className="z-2000 max-w-[70%]" open={isDialogOpen} onOpenChange={setIsDialogOpen}>

                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="text-xs bg-transparent">
                                                {assignedDriver ? "Change Driver" : "Assign Driver"}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[500px]">

                                            <DialogHeader>
                                                <DialogTitle>
                                                    {assignedDriver ? "Change Driver" : "Assign Driver"} for Ride #{ride.id}
                                                </DialogTitle>
                                                <DialogDescription>Select a driver from the available list below.</DialogDescription>
                                            </DialogHeader>

                                            <div className="space-y-2 mt-4 flex flex-col items-center">
                                                <div className='relative w-max mb-5 '>
                                                    <input className='w-75 max-w-[85vw] h-5 p-4 rounded-full border border-neutral-400 focus:border-neutral-600 valid:border-neutral-600 outline-none' placeholder="Search with driver name" onChange={(e) => setSearchQuery(e.target.value)} value={searchQuery} required />
                                                    <Search size={18} className='absolute top-2 right-4 text-neutral-500' />
                                                </div>
                                                {drivers.map((driver) => (
                                                    <button
                                                        key={driver.id}
                                                        onClick={() => handleDriverAssignment(driver.id)}
                                                        className={`w-full p-4 border rounded-lg text-left transition-colors hover:bg-gray-50 ${assignedDriver === driver.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium text-gray-900">{driver.first_name} {driver.last_name}</p>
                                                            </div>
                                                            {/*<div className="text-right">
                                                            <p className="text-sm font-medium text-gray-900">{driver.rating} ⭐</p>
                                                            <p className="text-xs text-gray-500">Rating</p>
                                                        </div>*/}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                }
                            </div>
                        </div>

                        {/*<div>
                            <p className="text-sm text-gray-500 mb-1">Vehicle</p>
                            <div className="flex items-center gap-2">
                                <CarIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-base text-gray-900">
                                    {assignedDriverDetails?.vehicle || ride.vehicle || "Unassigned"}
                                </span>
                            </div>
                        </div>*/}

                        {ride.duration === "00:00:00" &&
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Return Ride</p>
                                <span className="text-base text-gray-900">{ride.return_ride ? "Yes" : "No"}</span>
                            </div>}
                    </div>
                </div>
            </div>
        </div>
    )
}
