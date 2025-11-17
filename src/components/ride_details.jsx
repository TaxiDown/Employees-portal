"use client"
import { X, ClockIcon, DollarSignIcon, UserIcon, Search } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTranslations } from "next-intl"
import { MessageCircleMore } from "lucide-react"
import { Textarea } from "./ui/textarea"
import { EuroIcon } from "lucide-react"
import { LaptopMinimalCheck } from "lucide-react"
import { Trash } from "lucide-react"
import { SquarePen } from "lucide-react"
import Cookies from 'js-cookie'



export default function RideDetails({ rideData, setShowRide, role }) {
  const router = useRouter()
  const dict = useTranslations("ride");
  const statusDict = useTranslations("status");
  const [updatedStatus, setUpdatedStatus] = useState('');
  const [status, setStatus] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const [statusID, setStatusID] = useState("");
  const [newStatusID, setNewStatusID] = useState("");

  const [isPaid, setIsPaid] = useState(rideData.flg_paid);

  const [ride, setRide] = useState(rideData)

  const [open, setOpen] = useState(false)

  const [assignedDriverDetails, setAssignedDriverDetails] = useState("")
  const [currentStatus, setCurrentStatus] = useState(ride.status)
  const [assignedDriver, setAssignedDriver] = useState(ride?.id_driver?.id)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [drivers, setDrivers] = useState([])
  const [statusOptions, setStatusOptions] = useState([])

  const [noteStatusOptions, setNoteStatusOptions] = useState([])

  const [reload, setReload] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [noteChange, setNoteChange] = useState("");
  const [updatedNote, setUpdatedNote] = useState("");

  const [id, setID] = useState("")

  useEffect(() => {
    const cookie = Cookies.get('id') ?? null
    setID(cookie)
  }, [])

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
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: newStatus }),
    })
    if (response.status === 200) {
      setCurrentStatus(newStatus)
      setReload(true);
      window.location.reload();
    }
  }

  const handleDriverAssignment = async (driverId) => {
    const response = await fetch(`/api/get_booking_details/${ride.id_booking}/get_rides/${ride.id}/assign_driver`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ driver_id: driverId }),
    })
    if (response.status === 200) {
      setAssignedDriver(driverId)
      setIsDialogOpen(false)
      setReload(true)
      window.location.reload();
    }
  }

  const [isChangePrice, setIsChangePrice] = useState(false);
  const [newPrice, setNewPrice] = useState(ride?.display_price || "");

  const changeDisplayPrice = async () => {
    const response = await fetch(`/api/get_booking_details/${ride.id_booking}/get_rides/${ride.id}/change_display_price`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ display_price: newPrice }),
    })
    if (response.status === 200) {
      setIsChangePrice(false);
      setRide(prev => ({
        ...prev,
        display_price: newPrice
      }));
    } else {

    }
  }

  const changePayment = async (status) => {
    const response = await fetch(`/api/get_booking_details/${ride.id_booking}/get_rides/${ride.id}/change_payment_status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ flg_paid: status }),
    })
    if (response.status === 200) {
      setRide(prev => ({
        ...prev,
        flg_paid: status
      }));
    }
  }

  const getAssignedDriverDetails = () => {
    console.log(ride)
    if (!assignedDriver) return null
    return drivers.find((driver) => driver.id == assignedDriver)
  }

  useEffect(() => {
    setAssignedDriverDetails(getAssignedDriverDetails())
  }, [drivers, assignedDriver])

  useEffect(() => {
    if (currentStatus === "Completed" || currentStatus === "Canceled") {
      setStatusOptions([])
    } else if (!assignedDriver) {
      setStatusOptions([
        { value: "Pending", label: statusDict("pending") },
        { value: "Canceled", label: statusDict("canceled") },
      ])
    } else if (currentStatus === "Confirmed") {
      setStatusOptions([
        { value: "Confirmed", label: statusDict("confirmed") },
        { value: "Completed", label: statusDict("completed") },
        { value: "Canceled", label: statusDict("canceled") },
      ])
    }
  }, [assignedDriver, currentStatus, statusDict])

  useEffect(() => {
    const getdrivers = async () => {
      const response = await fetch(`/api/get_drivers?page_size=100${searchQuery ? `&driver_name=${searchQuery}` : ""}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
      if (response.status === 200) {
        const driversObject = await response.json()
        setDrivers(driversObject.results)
      } else if (response.status === 401) {
        router.push("/unauthorized")
      }
    }
    getdrivers()
  }, [searchQuery])


  useEffect(() => {
    const getStatuses = async () => {
      const response = await fetch(`/api/get_statuses`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
      if (response.status === 200) {
        const responseObject = await response.json()
        console.log(responseObject)
        setNoteStatusOptions(responseObject.results)
      } else if (response.status === 401) {
        router.push("/unauthorized")
      }
    }
    getStatuses()
  }, [])

  const [comment, setComment] = useState("")
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    setComment(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"; // expand
    }
  };

  const handleAddNote = async () => {
    const response = await fetch(`/api/get_booking_details/${ride.id_booking}/get_rides/${ride.id}/add_note`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ note: comment, status: statusID }),
    })
    if (response.status === 201) {
      const newNote = await response.json()
      console.log(newNote)
      setRide(prev => ({
        ...prev,
        employees_notes: [
          ...prev.employees_notes,
          newNote
        ]
      }));
      setComment("");
      setStatusID("");
      setStatus("")
    }
  }

  const updateNote = async (noteID) => {

    const response = await fetch(`/api/get_booking_details/${ride.id_booking}/get_rides/${ride.id}/update_note/${noteID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ note: updatedNote , status: newStatusID}),
    })
    if (response.status === 200) {
      const newNote = await response.json()
      console.log(newNote)
      setRide(prev => ({
        ...prev,
        employees_notes: prev.employees_notes.map(note =>
          note.id === noteID
            ? newNote
            : note
        )
      }));
      setUpdatedNote("");
      setNoteChange("")
      setNewStatus("");
      setNewStatusID("")
    }
    setUpdatedNote("");
  }

  const deleteNote = async (noteID) => {
    const response = await fetch(`/api/get_booking_details/${ride.id_booking}/get_rides/${ride.id}/delete_note/${noteID}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
    if (response.status === 200) {
      const newNote = await response.json()
      console.log(newNote)
      setRide(prev => ({
        ...prev,
        employees_notes: prev.employees_notes.filter(
          note => note.id !== noteID
        )
      }));
      setComment("");
    }
  }

  return (
    <div className="fixed top-0 left-0 z-50 w-screen h-screen bg-black/20 backdrop-blur-xs flex items-center justify-center">
      <div className="w-[80%] lg:w-[50%] h-160 md:h-150 bg-white rounded-xl relative px-10 pt-10 md:p-20 md:pb-1 overflow-y-auto">
        <X
          size={27}
          className="absolute top-7 right-7 cursor-pointer"
          onClick={() => {
            setShowRide("")
            if (reload) window.location.reload()
          }}
        />
        <div className="flex flex-col gap-2 md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {dict("ride")} #{ride.id}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {dict("booking_id")}: {ride.id_booking}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`px-3 py-1 rounded-full font-medium bg-gray-200 text-gray-800`}>
              {statusDict(currentStatus.toLowerCase()) || booking.status}
            </Badge>
            {statusOptions.length > 0 && (
              <Select value={currentStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[140px] h-9 text-sm border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option, index) => (
                    <SelectItem key={index} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {role === "Super fleet manager" &&
              <div>
                <p className="text-sm text-gray-500 mb-1">{dict("price")}</p>
                <div className="flex items-center gap-2">
                  <EuroIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-base font-semibold text-gray-900">{ride.price}</span>
                </div>
              </div>
            }
            {!isChangePrice ?
              <div>
                <p className="text-sm text-gray-500 mb-1">{role === "Super fleet manager" ? dict("display_price") : dict("price")}</p>
                <div className="flex justify-between mr-4">
                  <div className="flex items-center gap-2">
                    <EuroIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-base font-semibold text-gray-900">{ride.display_price}</span>
                  </div>
                  <button onClick={() => setIsChangePrice(true)} className="py-1 px-3 text-white text-sm bg-gray-600 hover:bg-gray-900 rounded-md cursor-pointer">Change</button>
                </div>
              </div>
              :
              <div>
                <p className="text-sm text-gray-500 mb-1">{role === "Super fleet manager" ? dict("display_price") : dict("price")}</p>
                <div className="flex justify-between mr-1 mt-3">
                  <div className="flex items-center gap-2">
                    <input type="number" className="p-1 border border-gray-200 focus:border-gray-500 hover:border-gray-500 focus:border-gray-500 rounded-md" id="newPrice" name="newPrice" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={changeDisplayPrice} className={`py-1 px-3 text-white text-sm rounded-md ${newPrice != ride.display_price ? "bg-gray-800 hover:bg-gray-900 cursor-pointer" : "bg-gray-500 cursor-not-allowed"}`}>Save</button>
                    <button onClick={() => setIsChangePrice(false)} className={`text-sm rounded-md cursor-pointer text-gray-600 hover:text-gray-900`}><X size={20} /></button>

                  </div>
                </div>
              </div>
            }

            {ride.duration !== "00:00:00" && (
              <div>
                <p className="text-sm text-gray-500 mb-1">{dict("duration")}</p>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-base text-gray-900">{ride.duration}</span>
                </div>
              </div>
            )}

            {ride.duration === "00:00:00" && (
              <div>
                <p className="text-sm text-gray-500 mb-1">{dict("return_ride")}</p>
                <span className="text-base text-gray-900">{ride.return_ride ? dict("yes") : dict("no")}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">{dict("driver")}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  <div>
                    {assignedDriverDetails ? (
                      <span className="text-base text-gray-900 block">
                        {assignedDriverDetails.first_name} {assignedDriverDetails.last_name}
                      </span>
                    ) : (
                      <span className="text-base text-gray-900">{dict("unassigned")}</span>
                    )}
                  </div>
                </div>

                {ride.status !== "Canceled" && ride.status !== "Completed" && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs bg-transparent">
                        {assignedDriver ? dict("change_driver") : dict("assign_driver")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] h-[75%] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {assignedDriver ? dict("change_driver") : dict("assign_driver")} #{ride.id}
                        </DialogTitle>
                        <DialogDescription>{dict("select_driver")}</DialogDescription>
                      </DialogHeader>
                      <div className="flex items-center justify-center">
                        <button className="text-white bg-gray-500 px-3 py-1 rounded-md cursor-pointer hover:bg-red-800" onClick={() => handleDriverAssignment(null)}>Remove driver</button>
                      </div>

                      <div className="space-y-2  flex flex-col items-center">
                        <div className="relative w-max mb-5">
                          <input
                            className="w-75 max-w-[85vw] h-5 p-4 rounded-full border border-neutral-400 focus:border-neutral-600 outline-none"
                            placeholder={dict("search_driver")}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            value={searchQuery}
                          />
                          <Search size={18} className="absolute top-2 right-4 text-neutral-500" />
                        </div>
                        {drivers.map((driver) => (
                          <button
                            key={driver.id}
                            onClick={() => handleDriverAssignment(driver.id)}
                            className={`w-full p-4 border rounded-lg text-left transition-colors hover:bg-gray-50 ${assignedDriver === driver.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900">
                                {driver.first_name} {driver.last_name}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{dict("payment_status")}</p>
              <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                  <Badge
                    className={`px-3 py-1 rounded-full font-medium cursor-pointer hover:opacity-80 transition-opacity ${ride.flg_paid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                  >
                    {ride.flg_paid ? dict("paid") : dict("unpaid")}
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => changePayment(true)}>{dict("paid")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changePayment(false)}>{dict("unpaid")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/*<div >
              <p className="text-sm text-gray-500 mb-1">{dict("payment_status")}</p>
              <div className="flex items-center justify-between">
                <Badge
                  className={`px-3 py-1 rounded-full font-medium ${ride.flg_paid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                >
                  {ride.flg_paid ? dict("paid") : dict("unpaid")}
                </Badge>

                {!ride.flg_paid && (
                  <Button variant="outline" size="sm" className="bg-transparent text-xs" onClick={() => { changePayment(true) }}>
                    {dict("change_payment")}
                  </Button>
                )}
                {ride.flg_paid && (
                  <Button variant="outline" size="sm" className="bg-transparent text-xs" onClick={() => { changePayment(false) }}>
                    {dict("mark_unpaid")}
                  </Button>
                )}
              </div>
            </div>*/}


          </div>
        </div>


        <div className="flex flex-col justify-between  w-full mt-5 mb-1 py-5 border-t border-gray-200">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircleMore className="h-5 w-5" />
              <h2 className="text-lg font-semibold">{dict("notes")}</h2>

            </div>

            <div className="space-y-3 max-h-60 overflow-x-auto">
              {ride.employees_notes.map((note, index) => (
                <div key={index}>
                  {noteChange !== note.id ?
                    <div id={note.id} className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                      <div className="flex gap-2 items-center justify-between mb-1">
                        <div className="flex gap-2">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {note?.employee?.first_name} {note?.employee?.last_name}
                          </h3>
                          <div>
                            <Badge className={"text-xs text-gray-500"} variant="outline">{note.updated && "Updated"} {note.timestamp}</Badge>
                          </div>
                        </div>
                        {note.system_added ? <LaptopMinimalCheck size={20} strokeWidth={2.5} className="text-black" /> : id == note?.employee?.id &&
                          <div className="flex gap-2">
                            <button className="cursor-pointer" onClick={() => { setUpdatedNote(note.note); setNoteChange(note.id); }}><SquarePen className={" text-orange-500 hover:text-orange-700 "} size={17} strokeWidth={2.5} /></button>
                            <button className="cursor-pointer" onClick={() => deleteNote(note.id)}><Trash className={" text-red-500 hover:text-red-700"} size={17} strokeWidth={2.5} /></button>
                          </div>}
                      </div>
                      {note?.status && (
                        <div className="mb-3 flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Status:</span>
                          <Badge className={`text-xs font-semibold px-3 py-1 bg-gray-200 text-gray-800`}>
                            {note.status}
                          </Badge>
                        </div>
                      )}
                      <p className="text-gray-700 text-sm">{note.note}</p>
                    </div> :
                    <div className="bg-gray-100 rounded-lg p-4 border border-gray-200 flex flex-col gap-4">
                      <div className="flex gap-3">
  <label className="text-md font-medium text-stone-600 tracking-wide">
    {dict("status")}
  </label>

  <select
    value={newStatus}
    onChange={(e) => {
      setNewStatus(e.target.value);
      setNewStatusID(e.target.selectedOptions[0].id);
    }}
    className="border border-gray-300 h-8 rounded-lg px-3 w-full bg-white text-gray-900 text-sm focus:outline-none"
  >
    <option value="">{dict("select_status")}</option>

    {noteStatusOptions.length > 0 &&
      noteStatusOptions.map((status) => (
        <option key={status.id} id={status.id} value={status.status}>
          {status.status}
        </option>
      ))}
  </select>
</div>

                      <Textarea
                        id="updatedNote"
                        className="border-none rounded-lg p-3 w-full bg-white valid:border valid:border-gray-300 focus:border focus:border-gray-300"
                        value={updatedNote}
                        onChange={(e) => setUpdatedNote(e.target.value)}
                        placeholder={dict("add_note")}
                        required
                      />
                      <div className="flex justify-end gap-2">
                        <button className="cursor-pointer" onClick={() => { setNoteChange(""); setUpdatedNote(""); }}><Badge className={" bg-white text-black border-2 border-black hover:bg-black hover:text-white text-md"}>Cancel</Badge></button>
                        <button className="cursor-pointer" onClick={() => { updateNote(note.id) }}><Badge className={" bg-green-500 border-2 border-green-500 hover:bg-green-700 hover:border-green-700 text-md "}>Save</Badge></button>
                      </div>
                    </div>
                  }
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="space-y-3">
            <div className="flex gap-3">
  <label className="text-md font-medium text-stone-600 tracking-wide">
    {dict("status")}
  </label>

  <select
    value={status}
    onChange={(e) => {
      setStatus(e.target.value);
      setStatusID(e.target.selectedOptions[0].id);
    }}
    className="border border-gray-300 h-8 rounded-lg px-3 w-full bg-white text-gray-900 text-sm focus:outline-none"
  >
    <option value="">{dict("select_status")}</option>

    {noteStatusOptions.length > 0 &&
      noteStatusOptions.map((status) => (
        <option key={status.id} id={status.id} value={status.status}>
          {status.status}
        </option>
      ))}
  </select>
</div>

              <div className="flex gap-3 items-center">
                <h3 className="font-semibold text-stone-600">{dict("notes")}</h3>
                <Textarea
                  id="comment"
                  className="border border-gray-200 rounded-lg p-3 w-full resize-none min-h-24 outline-none"
                  value={comment}
                  ref={textareaRef}
                  onChange={handleChange}
                  placeholder={dict("add_note")}
                  required
                  rows={3}
                />
              </div>


              <div className="flex items-center gap-2">
                <Button
                  onClick={handleAddNote}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg py-2"
                >
                  {dict("add_note")}
                </Button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
