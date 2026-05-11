import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import BookingChat from '../../components/BookingChat'
import { 
  Calendar, 
  Star, 
  Clock,
  CheckCircle,
  AlertCircle,
  Car,
  DollarSign,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  FileText
} from 'lucide-react'

const MechanicBookingDetails = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

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
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus) => {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'badge-warning'
      case 'confirmed': return 'badge-info'
      case 'in_progress': return 'badge-warning'
      case 'completed': return 'badge-success'
      case 'cancelled': return 'badge-error'
      default: return 'badge-info'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Booking not found</h3>
            <button onClick={() => navigate('/mechanic/bookings')} className="btn-primary">
              Back to Bookings
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/mechanic/bookings')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Bookings
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
              <p className="text-gray-600 mt-2">
                Booking ID: {booking._id.slice(-8)}
              </p>
            </div>
            <span className={getStatusColor(booking.status)}>
              {booking.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Information */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Client Information</h3>
              </div>
              <div className="card-content">
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-medium">
                      {booking.client?.firstName?.[0]}{booking.client?.lastName?.[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">
                      {booking.client?.firstName} {booking.client?.lastName}
                    </h4>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {booking.client?.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {booking.client?.phone}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Service Details</h3>
              </div>
              <div className="card-content">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vehicle Info */}
                  <div>
                    <div className="flex items-center mb-2">
                      <Car className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Vehicle</span>
                    </div>
                    <p className="text-gray-900">
                      {booking.vehicle?.make} {booking.vehicle?.model}
                    </p>
                    <p className="text-sm text-gray-600">{booking.vehicle?.year}</p>
                    {booking.vehicle?.vin && (
                      <p className="text-xs text-gray-500">VIN: {booking.vehicle.vin}</p>
                    )}
                  </div>

                  {/* Schedule */}
                  <div>
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Schedule</span>
                    </div>
                    <p className="text-gray-900">{formatDate(booking.scheduledDate)}</p>
                    <p className="text-sm text-gray-600">{booking.scheduledTime}</p>
                    <p className="text-xs text-gray-500">
                      Duration: {booking.estimatedDuration} minutes
                    </p>
                  </div>

                  {/* Location */}
                  <div>
                    <div className="flex items-center mb-2">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Location</span>
                    </div>
                    <p className="text-gray-900 capitalize">{booking.location?.type}</p>
                    {booking.location?.type === 'mobile' && booking.location?.address && (
                      <p className="text-sm text-gray-600">{booking.location.address}</p>
                    )}
                    {booking.location?.type === 'shop' && (
                      <p className="text-sm text-gray-600">Your shop</p>
                    )}
                  </div>

                  {/* Pricing */}
                  <div>
                    <div className="flex items-center mb-2">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Cost</span>
                    </div>
                    <p className="text-gray-900">
                      ${booking.pricing?.estimatedCost || 0}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      {booking.pricing?.paymentStatus || 'pending'}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {booking.description && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Problem Description</h4>
                    <p className="text-gray-600">{booking.description}</p>
                  </div>
                )}

                {/* Vehicle Images */}
                {booking.images && booking.images.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Vehicle Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {booking.images.map((image, index) => (
                        <img
                          key={index}
                          src={image.url}
                          alt={`Vehicle image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Client Rating and Review */}
                {booking.status === 'completed' && booking.rating && (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Client Rating</h4>
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
                      <span className="ml-2 text-sm font-medium text-gray-900">{booking.rating.score}/5</span>
                    </div>
                    {booking.rating.review && (
                      <p className="mt-2 text-sm text-gray-700 italic">"{booking.rating.review}"</p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Rated on {booking.rating.createdAt ? new Date(booking.rating.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Actions */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
              </div>
              <div className="card-content space-y-3">
                {booking.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate('confirmed')}
                      disabled={updating}
                      className="btn-primary w-full"
                    >
                      Confirm Booking
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('cancelled')}
                      disabled={updating}
                      className="btn-secondary w-full"
                    >
                      Cancel Booking
                    </button>
                  </>
                )}
                {booking.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate('in_progress')}
                      disabled={updating}
                      className="btn-primary w-full"
                    >
                      Start Service
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('cancelled')}
                      disabled={updating}
                      className="btn-secondary w-full"
                    >
                      Cancel Booking
                    </button>
                  </>
                )}
                {booking.status === 'in_progress' && (
                  <button
                    onClick={() => handleStatusUpdate('completed')}
                    disabled={updating}
                    className="btn-primary w-full"
                  >
                    Service Complete
                  </button>
                )}
                {(booking.status === 'confirmed' || booking.status === 'in_progress' || booking.status === 'completed') && (
                  <button
                    onClick={() => navigate(`/mechanic/bookings/${bookingId}/create-invoice`)}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Create Invoice
                  </button>
                )}
                {booking.status === 'completed' && (
                  <p className="text-sm text-gray-600 text-center mt-2">
                    This booking has been completed
                  </p>
                )}
                {booking.status === 'cancelled' && (
                  <p className="text-sm text-gray-600 text-center">
                    This booking has been cancelled
                  </p>
                )}
              </div>
            </div>

            {/* Chat */}
            <BookingChat bookingId={bookingId} otherUser={booking.client} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MechanicBookingDetails
