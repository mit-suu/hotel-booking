"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Calendar, MapPin, DollarSign, Clock } from "lucide-react"

interface Booking {
  id: string
  hotelName: string
  location: string
  checkIn: string
  checkOut: string
  status: "completed" | "upcoming" | "cancelled"
  totalAmount: number
  roomType: string
  guests: number
  image: string
}

const BookingHistoryPage: React.FC = () => {
  const router = useRouter()

  // State for bookings data - initially empty
  const [bookings, setBookings] = React.useState<Booking[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Effect to fetch bookings data
  React.useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        // Replace with your actual API call
        // const response = await fetch('/api/bookings');
        // const data = await response.json();
        // setBookings(data);

        setLoading(false)
      } catch (err) {
        console.error("Error fetching bookings:", err)
        setError("Failed to load bookings")
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleBookingClick = (bookingId: string) => {
    router.push(`/bookings/${bookingId}`)
  }

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Booking History</h1>
            <div className="space-y-6">
              {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/4">
                        <div className="h-48 w-full bg-gray-200"></div>
                      </div>
                      <div className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          </div>
                          <div className="h-6 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="h-12 bg-gray-200 rounded"></div>
                          <div className="h-12 bg-gray-200 rounded"></div>
                          <div className="h-12 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </div>
    )
  }

  if (error) {
    return (
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Booking History</h1>
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Bookings</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
    )
  }

  if (bookings.length === 0) {
    return (
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Booking History</h1>
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Calendar className="w-16 h-16 mx-auto" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Bookings Found</h2>
              <p className="text-gray-600 mb-4">You haven't made any bookings yet.</p>
              <button
                  onClick={() => router.push("/")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Start Booking
              </button>
            </div>
          </div>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Booking History</h1>

          <div className="space-y-6">
            {bookings.map((booking) => (
                <div
                    key={booking.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleBookingClick(booking.id)}
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/4">
                      <img
                          src={booking.image || "/placeholder.svg?height=192&width=300"}
                          alt={booking.hotelName}
                          className="h-48 w-full object-cover"
                      />
                    </div>
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-semibold mb-2">{booking.hotelName}</h2>
                          <div className="flex items-center text-gray-600 mb-4">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{booking.location}</span>
                          </div>
                        </div>
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(booking.status)}`}
                        >
                      {booking.status}
                    </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-600">Check-in</div>
                            <div className="font-medium">{booking.checkIn}</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-600">Check-out</div>
                            <div className="font-medium">{booking.checkOut}</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm text-gray-600">Total Amount</div>
                            <div className="font-medium">${booking.totalAmount}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-4">{booking.roomType}</span>
                        <span>{booking.guests} Guests</span>
                      </div>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>
  )
}

export default BookingHistoryPage
