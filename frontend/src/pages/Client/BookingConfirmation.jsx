import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const BookingConfirmation = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBooking()
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        setBooking(data.booking)
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewBookings = () => {
    navigate('/client/bookings')
  }

  const handleHome = () => {
    navigate('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <button
            onClick={() => navigate('/client/bookings')}
            className="text-blue-600 hover:text-blue-800"
          >
            View My Bookings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Success Header */}
          <div className="bg-green-50 border-b border-green-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-green-900">Booking Confirmed!</h1>
                <p className="text-green-700">Your booking has been submitted successfully</p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h2>
            
            <div className="space-y-4">
              {/* Booking ID */}
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Booking ID</span>
                <span className="font-medium text-gray-900">{booking._id.slice(-8)}</span>
              </div>

              {/* Status */}
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {booking.status}
                </span>
              </div>

              {/* Mechanic */}
              <div className="py-3 border-b">
                <span className="text-gray-600 block mb-1">Mechanic</span>
                <span className="font-medium text-gray-900">{booking.mechanic?.businessName}</span>
                {booking.mechanic?.location && (
                  <p className="text-sm text-gray-500">{booking.mechanic.location.city}, {booking.mechanic.location.state}</p>
                )}
              </div>

              {/* Service */}
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Service</span>
                <span className="font-medium text-gray-900">{booking.service}</span>
              </div>

              {/* Vehicle */}
              <div className="py-3 border-b">
                <span className="text-gray-600 block mb-1">Vehicle</span>
                <span className="font-medium text-gray-900">
                  {booking.vehicle?.year} {booking.vehicle?.make} {booking.vehicle?.model}
                </span>
              </div>

              {/* Schedule */}
              <div className="py-3 border-b">
                <span className="text-gray-600 block mb-1">Scheduled Date & Time</span>
                <span className="font-medium text-gray-900">
                  {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                </span>
              </div>

              {/* Location Type */}
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Service Type</span>
                <span className="font-medium text-gray-900 capitalize">{booking.location?.type}</span>
              </div>

              {/* Address (if mobile) */}
              {booking.location?.type === 'mobile' && booking.location?.address && (
                <div className="py-3 border-b">
                  <span className="text-gray-600 block mb-1">Service Address</span>
                  <span className="font-medium text-gray-900">{booking.location.address}</span>
                </div>
              )}

              {/* Estimated Cost */}
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-600">Estimated Cost</span>
                <span className="font-bold text-gray-900 text-lg">${booking.pricing?.estimatedCost}</span>
              </div>

              {/* Description */}
              {booking.description && (
                <div className="py-3">
                  <span className="text-gray-600 block mb-1">Problem Description</span>
                  <span className="font-medium text-gray-900">{booking.description}</span>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">What's Next?</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>The mechanic will review your booking request</li>
                      <li>You'll receive a notification when the booking is confirmed</li>
                      <li>Contact the mechanic if you need to make changes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleViewBookings}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                View My Bookings
              </button>
              <button
                onClick={handleHome}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmation
