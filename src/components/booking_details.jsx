import React from 'react'

export default function BookingDetails() {
    const details={
        "id": 7,
        "price": "4575.38",
        "duration": "00:00:00",
        "status": "Pending",
        "flg_paid": false,
        "return_ride": false,
        "booking": {
            "id": 7,
            "booking_number": "BK-293420-1",
            "datetime_pickup": "2025-09-24T15:09:00",
            "pickup_coordinates": [
                -1.643878,
                42.816635
            ],
            "pickup_location": "Pamplona, Spain",
            "dropoff_coordinates": [
                -3.701219,
                40.421345
            ],
            "dropoff_location": "Madrid, Spain",
            "email": "rawda@gmail.com",
            "phone":"01015602499",
            "num_adult_seats": 2,
            "extra_child_seats": [],
            "return_ride": true,
            "datetime_return": "2025-09-26T20:09:00",
            "customer_note": "",
            "services": null
        },
        "customer": null,
        "driver": null,
        "vehicle": null
    }
  return (
    <div className='w-screen h-screen bg-black/40 flex items-center justify-center'>
        <div className='w-200 h-100 bg-white'></div>
        
    </div>
  )
}
