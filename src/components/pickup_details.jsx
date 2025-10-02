"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, Phone, Loader2Icon, Timer } from "lucide-react"
import { MapPinIcon } from "@heroicons/react/24/solid"
import { useTranslations } from "next-intl"
import SuccessModal from "./modal"

export default function PickupDetails({
  pickup, destination, pickupCoords, destinationCoords,
  phone, email, pickupDate, pickupTime,
  price, returnPrice, numAdultSeats, numChildSeats,
  services, customerNote, returnDate, returnTime,
  vehicleID, vehicleCategory, duration
}) {
  const router = useRouter();
  const pickupDict = useTranslations("pick");

  const [IsLogin, setLogin] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [type, setType] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [error, setError] = useState("");

  const [pickupData, setPickupData] = useState({
    pickup, pickupCoords, destination, destinationCoords,
    phone, pickupDate, pickupTime, vehicleID, vehicleCategory,
    price, returnPrice, numAdultSeats,
    child_seats: numChildSeats, returnDate, returnTime,
    customerNote, duration, services, email
  });

  const [paymentCash, setPaymentCash] = useState("cash");
  const formRef = useRef(null);

  const getScrollableParent = (el) => {
    if (!el) return document.scrollingElement || document.documentElement || document.body;
    let parent = el;
    while (parent && parent !== document.body) {
      const style = window.getComputedStyle(parent);
      const isScrollable = ["auto", "scroll", "overlay"].includes(style.overflowY);
      if (isScrollable && parent.scrollHeight > parent.clientHeight) return parent;
      parent = parent.parentElement;
    }
    return document.scrollingElement || document.documentElement || document.body;
  };

  const scrollToTop = () => {
    const scroller = getScrollableParent(formRef.current);
    try {
      scroller.scrollTo({ top: 0, behavior: "smooth" });
      if ([document.scrollingElement, document.documentElement, document.body].includes(scroller)) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      window.scrollTo(0, 0);
    }
  };

  const fetchData = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/validate_token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.status === 200) {
        setLoggedIn(true);
        setIsGuest(false);
        handleSubmit(e);
      } else {
        setLoggedIn(false);
        setLogin(true);
      }
    } catch {
      setLoggedIn(false);
      setLogin(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonLoading(true);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));

    const body = {
      datetime_pickup: `${pickupData.pickupDate}T${pickupData.pickupTime}:00`,
      pickup_coordinates: pickupData.pickupCoords,
      pickup_location: pickupData.pickup,
      phone_number: pickupData.phone,
      num_adult_seats: pickupData.numAdultSeats,
      child_seats: pickupData.child_seats,
      id_vehicle_category: pickupData.vehicleID,
      customer_note: pickupData.customerNote,
      services: pickupData.services
    };

    if (email) body.email = pickupData.email;
    if (pickupData.destination) {
      body.dropoff_coordinates = pickupData.destinationCoords;
      body.dropoff_location = pickupData.destination;
    }
    if (returnPrice) {
      body.return_ride = true;
      body.datetime_return = `${pickupData.returnDate}T${pickupData.returnTime}:00`;
    }
    if (pickupData.duration) {
      body.duration = pickupData.duration * 3600;
    }

    const response = await fetch(`/api/create_ride`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.status === 201) {
      setShowSuccess(true);
      setButtonLoading(false);
      setType("success");
      setTimeout(() => router.push(`/`), 4000);
    } else if (response.status == 429) {
      setShowSuccess(true);
      setType("limit");
      setButtonLoading(false);
      setTimeout(() => setShowSuccess(false), 5000);
    } else if (response.status == 401) {
      setLogin(true);
      setButtonLoading(false);
    } else if (data?.message?.phone_number?.[0] === "Invalid phone number.") {
      setError(pickupDict("invalidPhone"));
      scrollToTop();
      setButtonLoading(false);
    } else {
      setError(pickupDict("error"));
      scrollToTop();
      setButtonLoading(false);
    }
  };

  return (
    <>
      {showSuccess && <SuccessModal type={type} isGuest={isGuest} />}
      <form ref={formRef} className="flex items-center justify-center w-screen lg:w-full" onSubmit={fetchData}>
        <div className="lg:bg-white rounded-xl lg:shadow p-6 w-120 max-w-[90%]">
          {error && (
            <div className="mb-4 py-3 w-full bg-red-100 border-l-4 border-red-500 rounded text-red-800 text-center font-medium">
              {error}
            </div>
          )}
          <h2 className="text-lg font-semibold mb-1">{pickupDict("pickConfirm")}</h2>
          <p className="text-sm text-gray-500 mb-4">{pickupDict("details")}</p>

          <div className="space-y-4">
            <div className="flex gap-4 w-100 max-w-[90%]">
              <div className="flex flex-col items-center pt-2">
                {pickupData.destination ? (
                  <>
                    <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-md"></div>
                    <div className="w-px h-14 bg-gray-300 my-2"></div>
                    <MapPinIcon className="w-4 h-4 text-red-500" />
                  </>
                ) : (
                  <MapPinIcon className="w-5 h-7 text-gray-700" />
                )}
              </div>
              <div className="flex flex-col h-full gap-4">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-medium">{pickupDict("pickupLocation")}</p>
                    <p className="text-gray-600">{pickupData.pickup || "Not provided"}</p>
                  </div>
                </div>
                {pickupData.destination && (
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium">{pickupDict("destination")}</p>
                      <p className="text-gray-600">{pickupData.destination || "Not provided"}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {phone && (
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-700" />
                <div>
                  <p className="font-medium">{pickupDict("phone")}</p>
                  <p className="text-gray-600">{pickupData.phone || "Not provided"}</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-700" />
              <div>
                <p className="font-medium">{pickupDict("pickTime")}</p>
                <p className="text-gray-600">{pickupData.pickupDate}{"\u00A0\u00A0\u00A0"}{pickupData.pickupTime}</p>
              </div>
            </div>

            {duration && (
              <div className="flex items-center space-x-3">
                <Timer className="w-6 h-6 text-stone-700" />
                <div>
                  <p className="font-medium">{pickupDict("duration")}</p>
                  <p className="text-gray-600">
                    {pickupData.duration}{" "}
                    {pickupData.duration == 1 ? pickupDict("hour") : pickupDict("hours")}
                  </p>
                </div>
              </div>
            )}

            {pickupData.returnDate && (
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-700" />
                <div>
                  <p className="font-medium">{pickupDict("returnTime")}</p>
                  <p className="text-gray-600">{pickupData.returnDate}{"\u00A0\u00A0\u00A0"}{pickupData.returnTime}</p>
                </div>
              </div>
            )}

            <div className="w-full flex justify-between items-center pr-2 rounded-lg border-gray-200">
              <p className="text-orange-600 text-lg font-medium">{pickupDict("totalPrice")}</p>
              <p className="text-orange-600 text-xl font-bold">€{Number(pickupData.price) + Number(pickupData.returnPrice)}</p>
            </div>

            <Button
              className="w-full cursor-pointer text-white rounded-lg text-[17px] p-3 py-5 bg-orange-500 transition-transform duration-300 hover:scale-103 hover:bg-white hover:border-2 hover:border-black hover:text-black min-w-max"
              type="submit"
            >
              {buttonLoading ? (
                <>
                  <Loader2Icon className="animate-spin text-white" />
                  {pickupDict("loading")}
                </>
              ) : (
                pickupDict("confirm")
              )}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
