import React, { useEffect, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Child({ visibility, setChildSets, isVisible, setTotal}) {

  const dict = useTranslations('pick');

  const [seats, setSeats] = useState([]);
  const [seatCounts, setSeatCounts] = useState({});
  const [totalSeats, setTotalSeats] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/get_seats`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (response.status === 200) {
          const data = await response.json();
          setSeats(data);

          const initialCounts = {};
          data.forEach((seat) => {
            initialCounts[seat.id] = 0;
          });
          setSeatCounts(initialCounts);

        }
      } catch (err) {
        console.error("Error fetching seats:", err);
      }
    };
    fetchData();
  }, []);


  const handleIncrement = (seatId) => {
    setSeatCounts((prev) => ({
      ...prev,
      [seatId]: prev[seatId] + 1,
    }));
    setTotalSeats(totalSeats+1)
  };

  const handleDecrement = (seatId) => {
    setSeatCounts((prev) => ({
      ...prev,
      [seatId]: Math.max(0, prev[seatId] - 1),
    }));
    const seat = seatCounts[seatId];
    if(seat >= 1)
      setTotalSeats(Math.max(0,totalSeats-1))
  };

  const formattedSeats = Object.entries(seatCounts)
    .filter(([_, num_seats]) => num_seats > 0)
    .map(([id, num_seats]) => ({
      child_seat: Number(id),
      num_seats,
    }));

  return (
    <div className={`${isVisible? 'visible': 'invisible'} fixed top-0 left-0 w-screen h-screen z-1000 bg-black/50 flex justify-center items-center`}>
      <div className="relative w-120 bg-white h-60 rounded-lg px-10 py-2 min-h-max">
        <button className="cursor-pointer" onClick={() => visibility(false)}>
          <X className="absolute right-6 top-5" />
        </button>
        <h1 className="text-xl font-bold">{dict("childern_seats")}</h1>

        <div className="mt-8 mb-5 flex flex-col gap-4">
          {seats.map((seat) => (
            <div
              key={seat.id}
              className="flex items-center justify-between gap-2"
            > 
            <div className="flex justify-center items-center gap-1">

                <div className="w-9 h-9 flex-shrink-0">
                  <img
                    src={seat.seat_image || '/seat.png'}
                    alt="icon"
                    className="w-full h-full object-contain rounded"
                    onError={(e) => {
                      e.currentTarget.onerror = null;          // prevent loop if fallback fails
                      e.currentTarget.src = '/seat.png';       // leading slash => public/seat.png
                    }}
                  />
                </div>
              <div className="flex flex-col">
                <h1 className="text-lg mr-1">{seat.seat_type}</h1>
                <p className="text-md text-stone-500 ml-2">+€{seat.seat_cost}</p>
              </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleDecrement(seat.id)}
                  className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 border-2 rounded-sm border-stone-200 hover:bg-stone-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="w-max text-center rounded-md py-1 md:px-2">
                  {seatCounts[seat.id] ?? 0}
                </div>
                <button
                  type="button"
                  onClick={() => handleIncrement(seat.id)}
                  className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 border-2 rounded-sm border-stone-200 hover:bg-stone-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="w-full flex justify-center ">
          <button className="text-lg bg-black text-white cursor-pointer border-2 hover:border-black hover:bg-white hover:text-black px-5 py-2 mb-3 rounded-md" onClick={()=>{visibility(false); setChildSets(formattedSeats); setTotal(totalSeats)}}>
            {dict("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
