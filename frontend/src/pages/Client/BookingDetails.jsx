import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import BookingChat from '../../components/BookingChat'
import RatingForm from '../../components/RatingForm'

const BookingDetails = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showRatingForm, setShowRatingForm] = useState(false)
  const [error, setError] = useState('')
  const [mechanicId, setMechanicId] = useState(null)

  useEffect(() => {
    fetchBooking()
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        setBooking(data.booking)
        setMechanicId(data.booking.mechanic._id)
      } else {
        setError(data.message || 'Failed to fetch booking')
      }
    } catch (error) {
      setError('An error occurred while fetching booking details')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    if (!confirm(`Are you sure you want to change the status to ${newStatus}?`)) {
      return
    }

    setUpdating(true)
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchBooking()
      }
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleRatingSubmitted = () => {
    setShowRatingForm(false)
    fetchBooking()
    // Store the mechanic ID in localStorage so other pages can refresh their data
    if (mechanicId) {
      localStorage.setItem('lastRatedMechanic', mechanicId)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Booking Not Found'}</h2>
          <button
            onClick={() => navigate('/client/bookings')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/client/bookings')}
            className="text-gray-600 hover:text-gray-800 mb-4"
          >
            ← Back to Bookings
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {booking.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Information */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Booking Information</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID</span>
                  <span className="font-medium text-gray-900">{booking._id.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service</span>
                  <span className="font-medium text-gray-900">{booking.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Cost</span>
                  <span className="font-bold text-gray-900">${booking.pricing?.estimatedCost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Scheduled Date</span>
                  <span className="font-medium text-gray-900">
                    {new Date(booking.scheduledDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Scheduled Time</span>
                  <span className="font-medium text-gray-900">{booking.scheduledTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Type</span>
                  <span className="font-medium text-gray-900 capitalize">{booking.location?.type}</span>
                </div>
                {booking.location?.type === 'mobile' && booking.location?.address && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Address</span>
                    <span className="font-medium text-gray-900">{booking.location.address}</span>
                  </div>
                )}
                <div className="pt-4 border-t">
                  <span className="text-gray-600 block mb-2">Problem Description</span>
                  <p className="text-gray-900">{booking.description}</p>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Vehicle Information</h2>
              </div>
              <div className="px-6 py-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Make</span>
                  <span className="font-medium text-gray-900">{booking.vehicle?.make}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-gray-600">Model</span>
                  <span className="font-medium text-gray-900">{booking.vehicle?.model}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-gray-600">Year</span>
                  <span className="font-medium text-gray-900">{booking.vehicle?.year}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mechanic Information */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Mechanic</h2>
              </div>
              <div className="px-6 py-4">
                <p className="font-medium text-gray-900">{booking.mechanic?.businessName}</p>
                {booking.mechanic?.location && (
                  <p className="text-sm text-gray-500 mt-1">
                    {booking.mechanic.location.city}, {booking.mechanic.location.state}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Actions</h2>
              </div>
              <div className="px-6 py-4 space-y-3">
                {booking.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate('cancelled')}
                    disabled={updating}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Cancel Booking
                  </button>
                )}
                {booking.status === 'completed' && !booking.rating && (
                  <button
                    onClick={() => setShowRatingForm(!showRatingForm)}
                    className="w-full bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600"
                  >
                    {showRatingForm ? 'Cancel' : 'Rate This Service'}
                  </button>
                )}
              </div>
            </div>

            {/* Rating Form */}
            {booking.status === 'completed' && !booking.rating && showRatingForm && (
              <RatingForm
                bookingId={bookingId}
                onRatingSubmitted={handleRatingSubmitted}
              />
            )}

            {/* Rating (if exists) */}
            {booking.rating && (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Your Rating</h2>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-5 w-5 ${i < booking.rating.score ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  {booking.rating.review && (
                    <p className="mt-2 text-gray-700">{booking.rating.review}</p>
                  )}
                </div>
              </div>
            )}

            {/* Chat */}
            <BookingChat bookingId={bookingId} otherUser={booking.mechanic} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingDetails
