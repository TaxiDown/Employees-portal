export default function SuccessModal({ type, isGuest }) {
  
    return (
      <>
      {type === 'success' ?
        <div className="fixed inset-0 top-0 left-0 z-50 flex items-center justify-center bg-black/50 h-full w-screen">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
            <h2 className="text-green-600 text-xl font-semibold mb-2">Ride Created Successfully!</h2>
            {!isGuest &&
              <p className="text-gray-600">Your will be redirected to the bookings page.</p>
            }
          </div>
        </div> : type === 'limit' &&
        <div className="fixed inset-0 top-0 left-0 z-50 flex items-center justify-center bg-black/50 h-full w-screen">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
            <h2 className="text-red-600 text-xl font-semibold mb-2">You reached the limit, <br/>please try after 15 minutes.</h2>
          </div>
        </div>
      }
    </>
    );
  }
  